import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import FollowButton from '@/components/ui/FollowButton';
import ActivityCalendar from '@/components/ui/ActivityCalendar';
import { prisma } from '@/lib/prisma';
import { calculateRank } from '@/lib/rank';
import Link from 'next/link';

type Props = {
  params: { id: string };
};

export default async function UserProfilePage({ params }: Props) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentUserId = session?.user.id;
  const userId = params.id;

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
    notFound();
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
  if (currentUserId && currentUserId !== userId) {
    const followRecord = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
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

  const isOwnProfile = currentUserId === userId;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link
        href="/user"
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          color: '#666',
          textDecoration: 'none'
        }}
      >
        ← ユーザー一覧に戻る
      </Link>

      {/* プロフィールヘッダー */}
      <div style={{
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* アバター画像 */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {dbUser.avatar_url ? (
                <img
                  src={dbUser.avatar_url}
                  alt={dbUser.name || '名無しさん'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '40px' }}>👤</span>
              )}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                {dbUser.name || '名無しさん'}
              </h1>
              {/* 称号バッジ */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '8px',
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: rankInfo.color,
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#fff'
              }}>
                <span>{rankInfo.icon}</span>
                <span>{rankInfo.name} (ランク {rankInfo.rank})</span>
              </div>
              {isOwnProfile && (
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                  あなたのプロフィール
                </p>
              )}
            </div>
          </div>
          {!isOwnProfile && currentUserId && (
            <FollowButton userId={userId} isInitiallyFollowing={isFollowing} />
          )}
        </div>

        {/* ランク表示 */}
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: rankInfo.color,
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
            {rankInfo.icon} {rankInfo.name}
          </p>
        </div>

        {/* 統計情報 */}
        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {totalLikes}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              総いいね数
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {followersCount}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              フォロワー
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {followingCount}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              フォロー中
            </p>
          </div>
        </div>
      </div>

      {/* アクティビティカレンダー */}
      <div style={{ marginBottom: '30px' }}>
        <ActivityCalendar userId={userId} />
      </div>

      {/* エピソード一覧 */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>
          📝 投稿エピソード
        </h2>
        {episodes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
            まだエピソードが投稿されていません
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {episodes.map((episode: { id: string; content: string; created_at: Date; _count: { likes: number } }) => (
              <div
                key={episode.id}
                style={{
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: '#fff',
                }}
              >
                <p style={{ margin: '0 0 15px 0', fontSize: '16px', lineHeight: '1.6' }}>
                  {episode.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
                    {new Date(episode.created_at).toLocaleDateString('ja-JP')}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    ❤️ {episode._count.likes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
