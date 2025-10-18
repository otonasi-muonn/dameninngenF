import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PostForm from '../../_components/ui/PostForm';
import LikeButton from '../../_components/ui/LikeButton';

export default async function EpisodesPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // ログインユーザーの情報を取得
  const currentUser = userId ? await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true }
  }) : null;

  // 自分の投稿のみを取得
  const myEpisodes = userId ? await prisma.episode.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    include: {
      user: { select: { name: true } },
      _count: { select: { likes: true } },
      likes: { where: { user_id: userId }, select: { user_id: true } },
    },
  }) : [];

  return (
    <div style={{ padding: 16 }}>
      <h1>ダメ人間エピソード投稿</h1>

      {session ? (
        <div>
          <p>投稿者: {currentUser?.name || session.user.email}</p>
          <PostForm />
        </div>
      ) : (
        <div>
          <p>投稿するにはログインが必要です。</p>
          <Link href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
            ログインページへ
          </Link>
        </div>
      )}

      {/* 自分の投稿一覧 */}
      {session && (
        <div style={{ marginTop: 40 }}>
          <h2>あなたの投稿</h2>
          {myEpisodes.length > 0 ? (
            myEpisodes.map((episode) => (
              <div key={episode.id} style={{ 
                border: '1px solid #e1e8ed', 
                padding: 16, 
                marginBottom: 12, 
                borderRadius: 8,
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.4' }}>{episode.content}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#657786', fontSize: '14px' }}>
                  <span>{new Date(episode.created_at).toLocaleString()}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>❤️ {episode._count.likes}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              border: '1px dashed #ccc', 
              padding: 20, 
              textAlign: 'center', 
              borderRadius: 8,
              backgroundColor: '#f9f9f9',
              color: '#666'
            }}>
              <p>まだ投稿がありません</p>
              <p>上のフォームから最初の投稿をしてみましょう！</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}