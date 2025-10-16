import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 24時間前の日時を計算
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. 直近24時間以内に「いいね」された投稿を集計
    const topEpisodes = await prisma.like.groupBy({
      by: ['episode_id'],
      where: {
        created_at: {
          gte: twentyFourHoursAgo, // gte: Greater than or equal to (以上)
        },
      },
      // 2. いいねの数でグループ化し、カウント
      _count: {
        episode_id: true,
      },
      // 3. いいねの数が多い順に並び替え
      orderBy: {
        _count: {
          episode_id: 'desc',
        },
      },
      // 4. トップ1件だけ取得
      take: 1,
    });

    // TDNが見つからなかった場合
    if (topEpisodes.length === 0) {
      return NextResponse.json({ message: 'No TDN today' }, { status: 404 });
    }

    const tdnEpisodeId = topEpisodes[0].episode_id;

    // 5. 取得したIDを元に、エピソードの詳細情報を取得
    const tdnEpisode = await prisma.episode.findUnique({
      where: {
        id: tdnEpisodeId,
      },
      include: {
        user: { select: { name: true } },
        _count: { select: { likes: true } },
      },
    });

    return NextResponse.json(tdnEpisode);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch TDN' }, { status: 500 });
  }
}