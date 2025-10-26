import { prisma } from '@/lib/prisma';

const DAYS_TO_SHOW = 365;

/**
 * 特定ユーザーの活動履歴（投稿といいね）を日付ごとに集計する
 * @param userId 集計対象のユーザーID
 * @returns { date: string, count: number }[]  // date: 'YYYY-MM-DD'
 */
export async function getUserActivity(userId: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (DAYS_TO_SHOW - 1));
  startDate.setHours(0, 0, 0, 0);

  const activitiesResult = await prisma.$queryRaw<
    Array<{ date: string; count: number }>
  >`
    WITH episodes AS (
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
      FROM "Episode"
      WHERE user_id = ${userId} AND created_at >= ${startDate}
      GROUP BY date
    ), likes AS (
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
      FROM "Like"
      WHERE user_id = ${userId} AND created_at >= ${startDate}
      GROUP BY date
    ), combined AS (
      SELECT date, count FROM episodes
      UNION ALL
      SELECT date, count FROM likes
    )
    SELECT date, SUM(count)::int AS count
    FROM combined
    GROUP BY date
    ORDER BY date ASC;
  `;

  return activitiesResult;
}
