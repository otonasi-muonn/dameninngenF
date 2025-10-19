'use client';

import { useState } from 'react';

type Props = {
  userId: string;
  isInitiallyFollowing: boolean;
};

export default function FollowButton({ userId, isInitiallyFollowing }: Props) {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/follow', {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (res.ok) {
  setIsFollowing(!isFollowing);
} else {
  let errorMessage = '不明なエラー';
  try {
    const error = await res.json();
    errorMessage = error.message;
  } catch {
    // JSONが空だった場合はそのまま
  }
  console.error('APIエラー:', errorMessage);
}

    } catch (err) {
      console.error('通信エラー:', err);
    }

    setLoading(false);
  };

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
  //     // APIにDELETEだけでなくPOSTも追加したことで切り替えれるように
  //   try {
  //     const res = await fetch('/api/follow', {
  //       method: originalFollowingState ? 'DELETE' : 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ followingId: userId }),
  //     });

  //     if (!res.ok) {
  //       // エラーが発生した場合はUIを元の状態に戻す
  //       setIsFollowing(originalFollowingState);
  //       alert('操作に失敗しました。');
  //     }
      
  //     // router.refresh()を削除。ページの再読み込みはユーザーに委ねるか、
  //     // 親コンポーネントからのコールバックで対応する形になります。

  //   } catch (error) {
  //     console.error('フォロー/フォロー解除に失敗しました:', error);
  //     setIsFollowing(originalFollowingState);
  //     alert('通信エラーが発生しました。');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  //   return (
  //   <button
  //     onClick={handleToggleFollow}
  //     disabled={isLoading}
  //     style={{
  //       padding: '8px 16px',
  //       borderRadius: '99px',
  //       border: '1px solid',
  //       borderColor: isFollowing ? '#ccc' : '#1DA1F2',
  //       backgroundColor: isFollowing ? 'white' : '#1DA1F2',
  //       color: isFollowing ? 'black' : 'white',
  //       cursor: isLoading ? 'wait' : 'pointer',
  //       fontWeight: 'bold',
  //       transition: 'all 0.2s ease',
  //       minWidth: '100px',
  //     }}
  //   >
  //     {isLoading ? '処理中...' : isFollowing ? 'フォロー中' : 'フォロー'}
  //   </button>
  // );