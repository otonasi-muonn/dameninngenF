import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

import PostForm from './_components/ui/PostForm';

// page.tsxはサーバーコンポーネントなので、'use client'は不要
export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });

  // サーバーサイドでログイン状態を取得
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div>
      <h1>今日のダメ人間度管理アプリ (仮)</h1>

      {session ? (
        // ログインしている場合
        <div>
          <p>ようこそ、{session.user.email} さん</p>
          <PostForm /> {/* 投稿フォームを表示 */}
        </div>
      ) : (
        // ログインしていない場合
        <div>
          <p>投稿するにはログインが必要です。</p>
          <Link href="/login">ログインページへ</Link>
        </div>
      )}

      {/* ここに後でエピソード一覧が表示される */}
    </div>
  );
}