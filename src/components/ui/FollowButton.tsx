'use client';

import { useState } from 'react';

type FollowButtonProps = {
  userId: string;
  isInitiallyFollowing: boolean;
};

export default function FollowButton({ userId, isInitiallyFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const originalFollowingState = isFollowing;
    // UIを即時反映（オプティミスティックアップデート）
    setIsFollowing(!originalFollowingState);

    try {
      const res = await fetch('/api/follow', {
        method: originalFollowingState ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      });

      if (!res.ok) {
        // エラーが発生した場合はUIを元の状態に戻す
        setIsFollowing(originalFollowingState);
        alert('操作に失敗しました。');
      }
      
      // router.refresh() はプレビュー環境でエラーになるため削除。
      // 必要に応じて手動でページをリロードする必要があります。

    } catch (error) {
      console.error('フォロー/フォロー解除に失敗しました:', error);
      setIsFollowing(originalFollowingState);
      alert('通信エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      style={{
        padding: '8px 16px',
        borderRadius: '99px',
        border: '1px solid',
        borderColor: isFollowing ? '#ccc' : '#1DA1F2',
        backgroundColor: isFollowing ? 'white' : '#1DA1F2',
        color: isFollowing ? 'black' : 'white',
        cursor: isLoading ? 'wait' : 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        minWidth: '100px',
      }}
    >
      {isLoading ? '処理中...' : isFollowing ? 'フォロー中' : 'フォロー'}
    </button>
  );
}