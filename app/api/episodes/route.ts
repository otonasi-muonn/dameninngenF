import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { content } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  // 1. ログインしているユーザーの情報を取得
  const { data: { session } } = await supabase.auth.getSession();

  // ログインしていない場合はエラーを返す
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. 本文が空、または長すぎる場合はエラー
  if (!content || content.length > 200) {
    return NextResponse.json({ error: 'Content is invalid' }, { status: 400 });
  }

  try {
    // 3. データベースにエピソードを保存
    const episode = await prisma.episode.create({
      data: {
        content: content,
        user_id: session.user.id, // ログインしているユーザーのIDを紐付ける
      },
    });

    return NextResponse.json({ episode }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create episode' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const episodes = await prisma.episode.findMany({
      // 新しい投稿が上にくるように、作成日時で降順ソート
      orderBy: {
        created_at: 'desc',
      },
      // 投稿したユーザーの名前も一緒に取得する
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    return NextResponse.json(episodes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 });
  }
}