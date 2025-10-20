import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 過去30日間のTDNを取得
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 過去30日間のいいねを日ごとにグループ化
    type LikeItem = {
      created_at: Date | string;
      episode_id: string;
      episode: {
        id: string;
        content: string;
        created_at: Date | string;
        user: { name: string | null } | null;
      };
    };

    const likes = (await prisma.like.findMany({
      where: {
        created_at: { gte: thirtyDaysAgo },
      },
      include: {
        episode: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })) as LikeItem[];

    // 日ごとにエピソードをグループ化して最もいいねが多いものを抽出
  const dailyTdnMap = new Map<string, Map<string, { episode: LikeItem['episode']; count: number }>>();
  likes.forEach((like: LikeItem) => {
      const date = new Date(like.created_at).toISOString().split('T')[0]; // YYYY-MM-DD形式

      if (!dailyTdnMap.has(date)) {
        dailyTdnMap.set(date, new Map());
      }

      const episodeMap = dailyTdnMap.get(date)!;
      const episodeId = like.episode_id;

      if (!episodeMap.has(episodeId)) {
        episodeMap.set(episodeId, { episode: like.episode, count: 0 });
      }

      episodeMap.get(episodeId)!.count++;
    });

    // 各日の最もいいねが多いエピソードを取得
    const tdnHistory = Array.from(dailyTdnMap.entries())
      .map(([date, episodeMap]) => {
        // その日の最もいいねが多いエピソードを見つける
        let topEpisode = null;
        let maxLikes = 0;

        episodeMap.forEach((data) => {
          if (data.count > maxLikes) {
            maxLikes = data.count;
            topEpisode = data.episode;
          }
        });

        return {
          date,
          episode: topEpisode,
          likes: maxLikes,
        };
      })
      .filter(item => item.episode !== null) // エピソードが存在する日のみ
      .sort((a, b) => b.date.localeCompare(a.date)); // 日付の新しい順

    return NextResponse.json(tdnHistory);

  } catch (error) {
    console.error('Failed to fetch TDN history:', error);
    return NextResponse.json({ error: 'Failed to fetch TDN history' }, { status: 500 });
  }
}
