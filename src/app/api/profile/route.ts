import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, bio: true, birthday: true, avatar_url: true },
    });

    // ユーザーの投稿IDを取得
    const episodes = await prisma.episode.findMany({
      where: { user_id: user.id },
      select: { id: true },
    });
    const episodeIds = episodes.map(e => e.id);

    // 合計いいね数
    const likes_count = episodeIds.length
      ? await prisma.like.count({ where: { episode_id: { in: episodeIds } } })
      : 0;

    // 投稿数
    const episodes_count = await prisma.episode.count({ where: { user_id: user.id } });

    // 称号
    const title = likes_count > 5 ? '人気者' : null;            // いいねが5超
    const post_title = episodes_count >= 5 ? '常連投稿者' : null; // 投稿が5以上

    return NextResponse.json({
      name: dbUser?.name ?? '',
      bio: dbUser?.bio ?? '',
      birthday: dbUser?.birthday ? new Date(dbUser.birthday).toISOString().slice(0, 10) : null,
      avatar_url: dbUser?.avatar_url ?? '',
      email: user.email ?? '',
      likes_count,
      episodes_count,
      title,
      post_title,
    });
  } catch (e) {
    console.error('Profile GET error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();
    const name = form.get('name')?.toString() ?? '';
    const bio = form.get('bio')?.toString() ?? '';
    const birthdayStr = form.get('birthday')?.toString() ?? '';
    const avatarBase64 = form.get('avatar')?.toString() ?? null;

    let avatar_url: string | undefined;
    if (avatarBase64 && avatarBase64.startsWith('data:image/')) {
      const base64Data = avatarBase64.split(',')[1];
      const sizeInBytes = (base64Data.length * 3) / 4;
      if (sizeInBytes > 500_000) {
        return NextResponse.json({ error: 'Image too large (max 500KB)' }, { status: 400 });
      }
      avatar_url = avatarBase64;
    }

    const updated = await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        name: name || null,
        bio: bio || null,
        birthday: birthdayStr ? new Date(birthdayStr) : null,
        ...(avatar_url ? { avatar_url } : {}),
      },
      update: {
        name: name || null,
        bio: bio || null,
        birthday: birthdayStr ? new Date(birthdayStr) : null,
        ...(avatar_url ? { avatar_url } : {}),
      },
      select: { name: true, bio: true, birthday: true, avatar_url: true },
    });

    // 最新の集計も返す
    const episodes = await prisma.episode.findMany({
      where: { user_id: user.id },
      select: { id: true },
    });
    const episodeIds = episodes.map(e => e.id);

    const likes_count = episodeIds.length
      ? await prisma.like.count({ where: { episode_id: { in: episodeIds } } })
      : 0;

    const episodes_count = await prisma.episode.count({ where: { user_id: user.id } });

    const title = likes_count > 5 ? '人気者' : null;
    const post_title = episodes_count >= 5 ? '常連投稿者' : null;

    return NextResponse.json({
      name: updated.name ?? '',
      bio: updated.bio ?? '',
      birthday: updated.birthday ? new Date(updated.birthday).toISOString().slice(0, 10) : null,
      avatar_url: updated.avatar_url ?? '',
      email: user.email ?? '',
      likes_count,
      episodes_count,
      title,
      post_title,
    });
  } catch (e) {
    console.error('Profile POST error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}