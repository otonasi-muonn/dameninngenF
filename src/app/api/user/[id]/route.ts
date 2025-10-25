import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { calculateRank } from '@/lib/rank';

// GET /api/user/[id] — get specific user info
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const { id: userId } = await params;

    // ユーザー基本情報を取得
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar_url: true
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ユーザーの全エピソードの総いいね数を取得
    const totalLikesResult = await prisma.like.groupBy({
      by: ['episode_id'],
      where: {
        episode: {
          user_id: userId
        }
      },
      _count: {
        episode_id: true
      }
    });

    const totalLikes = totalLikesResult.reduce((sum: number, item: { _count: { episode_id: number } }) => sum + item._count.episode_id, 0);

    // ランクを計算
    const rankInfo = calculateRank(totalLikes);

    // フォロワー数とフォロー中の数を取得
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } })
    ]);

    // 現在のユーザーがこのユーザーをフォローしているか確認
    let isFollowing = false;
    if (currentUser && currentUser.id !== userId) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: userId
          }
        }
      });
      isFollowing = !!followRecord;
    }

    // ユーザーのエピソード一覧を取得（最新10件）
    const episodes = await prisma.episode.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        content: true,
        created_at: true,
        _count: {
          select: { likes: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    return NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        avatar_url: dbUser.avatar_url
      },
      totalLikes,
      rank: rankInfo,
      followersCount,
      followingCount,
      isFollowing,
      episodes: episodes.map((ep: { id: string; content: string; created_at: Date; _count: { likes: number } }) => ({
        id: ep.id,
        content: ep.content,
        created_at: ep.created_at,
        likes: ep._count.likes
      }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
