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
