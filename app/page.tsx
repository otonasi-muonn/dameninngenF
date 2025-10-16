import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PostForm from './_components/ui/PostForm';
import LikeButton from './_components/ui/LikeButton'; // 作成したいいねボタンをインポート

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // サーバーサイドでエピソード一覧を取得
  const episodes = await prisma.episode.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      // 投稿者の名前を取得
      user: {
        select: { name: true },
      },
      // ▼▼▼ いいねの情報を取得するように変更 ▼▼▼
      _count: {
        select: { likes: true }, // 各投稿のいいね数をカウント
      },
      likes: {
        where: { user_id: userId }, // ログイン中のユーザーがいいねしているか
        select: { user_id: true },
      },
      // ▲▲▲ ここまで変更 ▲▲▲
    },
  });

  return (
    <div>
      <h1>今日のダメ人間度管理アプリ (仮)</h1>

      {session ? (
        <div>
          <p>ようこそ、{session.user.email} さん</p>
          <PostForm />
        </div>
      ) : (
        <div>
          <p>投稿するにはログインが必要です。</p>
          <Link href="/login">ログインページへ</Link>
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <h2>みんなのダメ人間エピソード</h2>
        {episodes.map((episode) => (
          <div key={episode.id} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
            <p>{episode.content}</p>
            <small>
              投稿者: {episode.user?.name || '名無しさん'} - {new Date(episode.created_at).toLocaleString()}
            </small>
            
            {/* ▼▼▼ いいねボタンを設置 ▼▼▼ */}
            {session && ( // ログインしている時だけボタンを表示
              <LikeButton
                episodeId={episode.id}
                initialLikes={episode._count.likes}
                isInitiallyLiked={episode.likes.length > 0}
              />
            )}
            {/* ▲▲▲ ここまで ▲▲▲ */}
          </div>
        ))}
      </div>
    </div>
  );
}