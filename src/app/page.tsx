
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import EpisodeSearchList from '@/components/ui/EpisodeSearchList';
import DameningenDiagnosis from '@/components/ui/DameningenDiagnosis';
import { calculateRank, getRankColor } from '@/lib/rank';

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // ログインユーザーの情報とランクを取得
  let currentUser = null;
  let rankInfo = null;
  let totalLikes = 0;

  if (userId) {
    // ユーザー情報取得
    currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    // 総いいね数を計算
    const likesCount = await prisma.like.count({
      where: {
        episode: {
          user_id: userId
        }
      }
    });

    totalLikes = likesCount;
    rankInfo = calculateRank(totalLikes);
  }

  // サーバーサイドでエピソード一覧を取得
  let episodes = [];
  try {
    episodes = await prisma.episode.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { name: true } },
        _count: { select: { likes: true } },
        likes: {
          where: { user_id: userId || '' },
          select: { user_id: true },
        },
        comments: {
          include: { user: { select: { name: true } } },
          orderBy: { created_at: 'asc' },
        },
      },
    });
  } catch (fetchErr) {
    // DB に Comment テーブルが存在しない等で失敗する環境があるため、安全にフォールバックして再取得します。
    // 本番でテーブルが存在する前提ならこの catch は不要ですが、開発環境の差異に対応するために追加します。
    // eslint-disable-next-line no-console
    console.warn('episodes.findMany(include: comments) failed, retrying without comments:', String(fetchErr));
    episodes = await prisma.episode.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { name: true } },
        _count: { select: { likes: true } },
        likes: {
          where: { user_id: userId || '' },
          select: { user_id: true },
        },
        // comments を含めないフォールバック
      },
    });
    // コメントが無い環境向けに型を満たすため、空配列を補っておく
    episodes = episodes.map((ep) => ({ ...ep, comments: [] }));
  }

 
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* ヘッダー */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        padding: '20px 0',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          今日のダメ人間度管理アプリ
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>あなたのダメ人間エピソードを共有しよう</p>
      </header>

      {/* ユーザー情報バー */}
      {user ? (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {(currentUser?.name || user.email || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ fontWeight: 'bold', margin: 0, fontSize: '20px' }}>
                {currentUser?.name || user.email}
              </p>
              {rankInfo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: getRankColor(rankInfo.rank),
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: `${getRankColor(rankInfo.rank)}20`,
                    border: `2px solid ${getRankColor(rankInfo.rank)}40`
                  }}>
                    Rank {rankInfo.rank}
                  </span>
                  <span style={{ fontSize: '14px', color: '#999' }}>
                    {totalLikes} ❤️
                  </span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link 
              href="/episodes" 
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#667eea',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              📝 投稿する
            </Link>
            <form action="/login" method="post" style={{ display: 'inline' }}>
              <button 
                type="submit" 
                style={{ 
                  padding: '10px 20px',
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '24px',
          backgroundColor: '#fff3cd',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #ffc107',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 16px 0', color: '#856404' }}>
            投稿やいいねをするにはログインが必要です
          </p>
          <Link 
            href="/login" 
            style={{ 
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#667eea',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            ログイン
          </Link>
        </div>
      )}

      {/* ダメ人間度診断 */}
      <DameningenDiagnosis />
      {/* エピソード一覧（検索機能付き） */}
      <EpisodeSearchList episodes={episodes} isLoggedIn={!!user} />
    </div>
  );
}