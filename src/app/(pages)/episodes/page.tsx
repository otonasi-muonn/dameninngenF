import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PostForm from '@/components/ui/PostForm';
// Define a lightweight local type matching the fields we use in this component
type EpisodeItem = {
  id: string;
  content: string;
  created_at: string | Date;
  user?: { name?: string | null } | null;
  _count: { likes: number };
  likes: Array<{ user_id: string }>;
};

export default async function EpisodesPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // ログインユーザーの情報を取得
  const currentUser = userId ? await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, avatar_url: true }
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
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        ダメ人間エピソード投稿
      </h1>

      {user ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
  {currentUser?.avatar_url ? (
    <img
      src={currentUser.avatar_url}
      alt="avatar"
      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
    />
  ) : (
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
      }}
    >
      👤
    </div>
  )}
  <p style={{ fontSize: '16px', color: '#333', margin: 0 }}>
    {currentUser?.name || user.email}
  </p>
</div>

          
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
      {user && (
        <div style={{ marginTop: 40 }}>
          <h2>あなたの投稿</h2>
          {myEpisodes.length > 0 ? (
            myEpisodes.map((episode: EpisodeItem) => (
              <div key={episode.id} style={{ 
                  border: '1px solid #e1e8ed', 
                  padding: '16px', 
                  marginBottom: '16px', 
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
                  {episode.content}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '12px', 
                  fontSize: '14px', 
                  color: '#888' 
                }}>
                  <span>{new Date(episode.created_at).toLocaleString()}</span>
                  <span>❤️ {episode._count.likes}</span>
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

