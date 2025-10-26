import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { calculateRank } from '@/lib/rank';

// GET /api/user — get current logged in user info
export async function GET() {
  try {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true }
    });

    // ユーザーの全エピソードの総いいね数を取得
    const totalLikesResult = await prisma.like.groupBy({
      by: ['episode_id'],
      where: {
        episode: {
          user_id: user.id
        }
      },
      _count: {
        episode_id: true
      }
    });

    const totalLikes = totalLikesResult.reduce((sum, item) => sum + item._count.episode_id, 0);

    // ランクを計算
    const rankInfo = calculateRank(totalLikes);

    return NextResponse.json({
      user: dbUser,
      totalLikes,
      rank: rankInfo
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
