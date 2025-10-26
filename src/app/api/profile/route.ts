import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, bio: true, birthday: true, avatar_url: true },
    });

    // 集計
    const [likes_count, episodes_count, following_count, followers_count] = await Promise.all([
      prisma.like.count({ where: { episode: { user_id: user.id } } }),
      prisma.episode.count({ where: { user_id: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.follow.count({ where: { followingId: user.id } }),
    ]);

    // 称号を配列で（累積表示）
    const titles: string[] = [];
    if (likes_count >= 100) titles.push('神');
    if (likes_count >= 50)  titles.push('カリスマ');
    if (likes_count >= 40)  titles.push('インフルエンサー');
    if (likes_count >= 30)  titles.push('エース');
    if (likes_count >= 20)  titles.push('レジェンド');
    if (likes_count >= 10)  titles.push('スーパースター');
    if (likes_count > 5)    titles.push('人気者');
    if (likes_count >= 1)   titles.push('初いいね獲得');

    const post_titles: string[] = [];
    if (episodes_count >= 100) post_titles.push('伝説の語り部');
    if (episodes_count >= 50)  post_titles.push('エピソード王');
    if (episodes_count >= 40)  post_titles.push('ストーリーテラー');
    if (episodes_count >= 30)  post_titles.push('エリート投稿者');
    if (episodes_count >= 20)  post_titles.push('マスター投稿者');
    if (episodes_count >= 10)  post_titles.push('ベテラン投稿者');
    if (episodes_count >= 5)   post_titles.push('常連投稿者');
    if (episodes_count >= 1)   post_titles.push('初投稿');

    // フォロワー称号（累積）
    const follower_titles: string[] = [];
    if (followers_count >= 100) follower_titles.push('神推し');
    if (followers_count >= 50)  follower_titles.push('フォロワーカリスマ');
    if (followers_count >= 40)  follower_titles.push('フォロワーインフルエンサー');
    if (followers_count >= 30)  follower_titles.push('フォロワーエース');
    if (followers_count >= 20)  follower_titles.push('フォロワーレジェンド');
    if (followers_count >= 10)  follower_titles.push('フォロワースーパースター');
    if (followers_count >= 5)   follower_titles.push('フォロワー人気者');
    if (followers_count >= 1)   follower_titles.push('初フォロワー獲得');


    // フォロー中称号（累積）
    const following_titles: string[] = [];
    if (following_count >= 100) following_titles.push('コネクト神');
    if (following_count >= 50)  following_titles.push('コミュニティマスター');
    if (following_count >= 40)  following_titles.push('スーパーネットワーカー');
    if (following_count >= 30)  following_titles.push('ネットワーカー');
    if (following_count >= 20)  following_titles.push('コネクター');
    if (following_count >= 10)  following_titles.push('コミュニティビルダー');
    if (following_count >= 5)   following_titles.push('交流好き');
    if (following_count >= 1)   following_titles.push('初フォロー');

    return NextResponse.json({
      name: dbUser?.name ?? '',
      bio: dbUser?.bio ?? '',
      birthday: dbUser?.birthday ? new Date(dbUser.birthday).toISOString().slice(0, 10) : null,
      avatar_url: dbUser?.avatar_url ?? '',
      email: user.email ?? '',
      likes_count,
      episodes_count,
      following_count,
      followers_count,
      titles,           // 配列で返す
      post_titles,      // 配列で返す
      follower_titles,
      following_titles,
    });
  } catch (e) {
    console.error('Profile GET error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });
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

    // 最新集計
    const [likes_count, episodes_count, following_count, followers_count] = await Promise.all([
      prisma.like.count({ where: { episode: { user_id: user.id } } }),
      prisma.episode.count({ where: { user_id: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.follow.count({ where: { followingId: user.id } }),
    ]);

    const titles: string[] = [];
    if (likes_count >= 100) titles.push('神');
    if (likes_count >= 50)  titles.push('カリスマ');
    if (likes_count >= 40)  titles.push('インフルエンサー');
    if (likes_count >= 30)  titles.push('エース');
    if (likes_count >= 20)  titles.push('レジェンド');
    if (likes_count >= 10)  titles.push('スーパースター');
    if (likes_count > 5)    titles.push('人気者');
    if (likes_count >= 1)   titles.push('初いいね獲得');

    const post_titles: string[] = [];
    if (episodes_count >= 100) post_titles.push('伝説の語り部');
    if (episodes_count >= 50)  post_titles.push('エピソード王');
    if (episodes_count >= 40)  post_titles.push('ストーリーテラー');
    if (episodes_count >= 30)  post_titles.push('エリート投稿者');
    if (episodes_count >= 20)  post_titles.push('マスター投稿者');
    if (episodes_count >= 10)  post_titles.push('ベテラン投稿者');
    if (episodes_count >= 5)   post_titles.push('常連投稿者');
    if (episodes_count >= 1)   post_titles.push('初投稿');


    const follower_titles: string[] = [];
    if (followers_count >= 100) follower_titles.push('神推し');
    if (followers_count >= 50)  follower_titles.push('フォロワーカリスマ');
    if (followers_count >= 40)  follower_titles.push('フォロワーインフルエンサー');
    if (followers_count >= 30)  follower_titles.push('フォロワーエース');
    if (followers_count >= 20)  follower_titles.push('フォロワーレジェンド');
    if (followers_count >= 10)  follower_titles.push('フォロワースーパースター');
    if (followers_count >= 5)   follower_titles.push('フォロワー人気者');
    if (followers_count >= 1)   follower_titles.push('初フォロワー獲得');

    const following_titles: string[] = [];
    if (following_count >= 100) following_titles.push('コネクト神');
    if (following_count >= 50)  following_titles.push('コミュニティマスター');
    if (following_count >= 40)  following_titles.push('スーパーネットワーカー');
    if (following_count >= 30)  following_titles.push('ネットワーカー');
    if (following_count >= 20)  following_titles.push('コネクター');
    if (following_count >= 10)  following_titles.push('コミュニティビルダー');
    if (following_count >= 5)   following_titles.push('交流好き');
    if (following_count >= 1)   following_titles.push('初フォロー');

    return NextResponse.json({
      name: updated.name ?? '',
      bio: updated.bio ?? '',
      birthday: updated.birthday ? new Date(updated.birthday).toISOString().slice(0, 10) : null,
      avatar_url: updated.avatar_url ?? '',
      email: user.email ?? '',
      likes_count,
      episodes_count,
      following_count,
      followers_count,
      titles,
      post_titles,
      follower_titles,
      following_titles,
    });
  } catch (e) {
    console.error('Profile POST error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}