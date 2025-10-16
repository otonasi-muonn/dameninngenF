import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// `params` を受け取ることで、URLの [episode_id] を取得できる
export async function POST(
  request: Request,
  { params }: { params: { episode_id: string } }
) {
  const episode_id = params.episode_id;
  const supabase = createRouteHandlerClient({ cookies });

  // ログインユーザーの情報を取得
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user_id = session.user.id;

  try {
    // 既に「いいね」しているか確認
    const existingLike = await prisma.like.findUnique({
      where: {
        user_id_episode_id: { // schema.prismaで定義した複合主キー @@id([user_id, episode_id]) を使う
          user_id: user_id,
          episode_id: episode_id,
        },
      },
    });

    if (existingLike) {
      // いいねが存在する場合 → いいねを取り消す (DELETE)
      await prisma.like.delete({
        where: {
          user_id_episode_id: {
            user_id: user_id,
            episode_id: episode_id,
          },
        },
      });
      return NextResponse.json({ message: 'Unliked' });
    } else {
      // いいねが存在しない場合 → 新しくいいねを追加する (CREATE)
      await prisma.like.create({
        data: {
          user_id: user_id,
          episode_id: episode_id,
        },
      });
      return NextResponse.json({ message: 'Liked' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}