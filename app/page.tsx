import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PostForm from './_components/ui/PostForm';
import LikeButton from './_components/ui/LikeButton';

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

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // サーバーサイドでエピソード一覧とTDNを並行して取得
  const [episodes, tdn] = await Promise.all([
    prisma.episode.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { name: true },
        },
        _count: {
          select: { likes: true },
        },
        likes: {
          where: { user_id: userId || '' },
          select: { user_id: true },
        },
      },
    }),
    getTdn(),
  ]);

  return (
    <div>
      <h1>今日のダメ人間度管理アプリ (仮)</h1>

      {/* TDN表示エリア */}
      <div style={{ border: '2px solid gold', padding: '20px', margin: '20px 0', backgroundColor: '#fffacd' }}>
        <h2>👑 今日のダメ人間 (TDN) 👑</h2>
        {tdn ? (
          <div>
            <h3>{tdn.content}</h3>
            <p>投稿者: {tdn.user?.name || '名無しさん'}</p>
            <p>いいね数: {tdn._count.likes}</p>
          </div>
        ) : (
          <p>今日のダメ人間はまだいません。あなたが初代TDNになるチャンス！</p>
        )}
      </div>

      {/* ログイン状態による表示切り替え */}
      {session ? (
        <div>
          <p>ようこそ、{session.user.email} さん</p>
          <form action="/api/auth/logout" method="post" style={{ display: 'inline', marginLeft: '20px' }}>
            <button type="submit" style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>
              ログアウト
            </button>
          </form>
          <PostForm />
        </div>
      ) : (
        <div>
          <p>投稿やいいねをするにはログインが必要です。</p>
          <Link href="/login" style={{ color: 'blue' }}>ログインページへ</Link>
        </div>
      )}

      {/* エピソード一覧 */}
      <div style={{ marginTop: '40px' }}>
        <h2>みんなのダメ人間エピソード</h2>
        {episodes.map((episode) => (
          <div key={episode.id} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
            <p>{episode.content}</p>
            <small>
              投稿者: {episode.user?.name || '名無しさん'} - {new Date(episode.created_at).toLocaleString()}
            </small>
            
            {/* ログインしている時だけいいねボタンを表示 */}
            {session && (
              <LikeButton
                episodeId={episode.id}
                initialLikes={episode._count.likes}
                isInitiallyLiked={episode.likes.length > 0}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}