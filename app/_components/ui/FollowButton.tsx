'use client'; // このコンポーネントはクライアント側で動作する

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 親コンポーネントから渡される props の型定義
type Props = {
  userId: string; // 表示対象ユーザーのID
  isInitiallyFollowing: boolean; // 初期状態でフォロー済みかどうか
};

export default function FollowButton({ userId, isInitiallyFollowing }: Props) {
  // フォロー状態とローディング状態を管理
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient(); // Supabase クライアントを生成

  // フォローボタンを押したときの処理（フォロー or フォロー解除）
  const handleToggleFollow = async () => {
    if (loading) return; // 二重クリック防止
    setLoading(true);

    // ログイン中のユーザー情報を取得
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) {
      console.error('ログインユーザーが取得できません');
      setLoading(false);
      return;
    }

    if (isFollowing) {
      // 🗑️ フォロー解除（Follow テーブルから削除）
      const { error } = await supabase
        .from('Follow')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('followed_id', userId);

      if (!error) {
        setIsFollowing(false); // 状態を更新
      } else {
        console.error('フォロー解除失敗:', error.message);
      }
    } else {
      // ➕ フォロー追加（Follow テーブルに挿入）
      const { error } = await supabase.from('Follow').insert([
        {
          follower_id: currentUser.id,
          followed_id: userId,
        },
      ]);

      if (!error) {
        setIsFollowing(true); // 状態を更新
      } else {
        console.error('フォロー失敗:', error.message);
      }
    }

    setLoading(false); // ローディング解除
  };

  // ボタンの表示とスタイル
  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        backgroundColor: isFollowing ? '#ccc' : '#0070f3',
        color: '#fff',
        border: 'none',
        cursor: loading ? 'wait' : 'pointer',
        fontWeight: 'bold',
      }}
    >
      {isFollowing ? 'フォローしました' : 'フォロー'}
    </button>
  );
}
