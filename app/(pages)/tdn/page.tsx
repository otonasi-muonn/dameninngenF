import { prisma } from '@/lib/prisma';

// TDNのデータを取得する関数
async function getTdn() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const topLikes = await prisma.like.groupBy({
      by: ['episode_id'],
      where: {
        created_at: { gte: twentyFourHoursAgo },
      },
      _count: { episode_id: true },
      orderBy: { _count: { episode_id: 'desc' } },
      take: 1,
    });

    if (topLikes.length === 0) {
      // 24時間以内のいいねがない場合、全ての期間でトップの投稿を探す
      const allTimeTop = await prisma.episode.findFirst({
        orderBy: {
          likes: {
            _count: 'desc',
          },
        },
        include: {
          user: { select: { name: true } },
          _count: { select: { likes: true } },
        },
      });
      return allTimeTop;
    }

    const tdnEpisode = await prisma.episode.findUnique({
      where: { id: topLikes[0].episode_id },
      include: {
        user: { select: { name: true } },
        _count: { select: { likes: true } },
      },
    });
    return tdnEpisode;
  } catch (error) {
    console.error('Failed to fetch TDN:', error);
    return null;
  }
}

export default async function TdnPage() {
  const tdn = await getTdn();

  return (
    <div style={{ padding: 16 }}>
      <h1>👑 今日のダメ人間 (TDN) 👑</h1>
      
      {tdn ? (
        <div style={{ border: '2px solid gold', backgroundColor: '#fffacd', padding: 20, borderRadius: 8, margin: '20px 0' }}>
          <h2 style={{ marginTop: 0, color: '#b8860b' }}>{tdn.content}</h2>
          <div style={{ marginTop: 15 }}>
            <p><strong>投稿者:</strong> {tdn.user?.name || '名無しさん'}</p>
            <p><strong>いいね数:</strong> {tdn._count.likes}</p>
            <p><strong>投稿日時:</strong> {new Date(tdn.created_at).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, backgroundColor: '#f9f9f9' }}>
          <p>今日のダメ人間はまだいません。</p>
          <p>あなたが初代TDNになるチャンス！</p>
        </div>
      )}
      
      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>
          TDNは24時間以内に最もいいねを獲得したエピソードです
        </p>
      </div>
    </div>
  );
}