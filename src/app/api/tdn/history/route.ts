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

    // DB側で日ごとのエピソードごとのいいね数を集計し、各日で最大のものを選ぶ
    const rows = await prisma.$queryRaw<Array<{
      date: string;
      episode_id: string;
      content: string;
      created_at: Date;
      user_name: string | null;
      likes: number;
    }>>`
      WITH daily_counts AS (
        SELECT date_trunc('day', "created_at") AS day, "episode_id", COUNT(*)::int AS cnt
        FROM "Like"
        WHERE "created_at" >= ${thirtyDaysAgo}
        GROUP BY day, "episode_id"
      ), ranked AS (
        SELECT day, "episode_id", cnt, ROW_NUMBER() OVER (PARTITION BY day ORDER BY cnt DESC) AS rn
        FROM daily_counts
      )
      SELECT to_char(day, 'YYYY-MM-DD') AS date,
             e."id" AS episode_id,
             e."content" AS content,
             e."created_at" AS created_at,
             u."name" AS user_name,
             r.cnt AS likes
      FROM ranked r
      JOIN "Episode" e ON e."id" = r."episode_id"
      LEFT JOIN "User" u ON u."id" = e."user_id"
      WHERE r.rn = 1
      ORDER BY date DESC;
    `;

    // rows を期待するAPI形に整形して返す
    const tdnHistory = rows.map(r => ({
      date: r.date,
      episode: {
        id: r.episode_id,
        content: r.content,
        created_at: r.created_at,
        user: { name: r.user_name }
      },
      likes: r.likes,
    }));

    return NextResponse.json(tdnHistory);

  } catch (error) {
    console.error('Failed to fetch TDN history:', error);
    return NextResponse.json({ error: 'Failed to fetch TDN history' }, { status: 500 });
  }
}
