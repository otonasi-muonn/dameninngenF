'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Props = {
  userId: string;
  isInitiallyFollowing: boolean;
};

export default function FollowButton({ userId, isInitiallyFollowing }: Props) {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleFollow = async () => {
    if (isFollowing || loading) return;

    setLoading(true);

    const { error } = await supabase.from('Follow').insert([
      {
        follower_id: (await supabase.auth.getUser()).data.user?.id,
        followed_id: userId,
      },
    ]);

    if (!error) {
      setIsFollowing(true);
    } else {
      console.error('フォロー失敗:', error.message);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isFollowing || loading}
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        backgroundColor: isFollowing ? '#ccc' : '#0070f3',
        color: '#fff',
        border: 'none',
        cursor: isFollowing ? 'default' : 'pointer',
        fontWeight: 'bold',
      }}
    >
      {isFollowing ? 'フォローしました' : 'フォロー'}
    </button>
  );
}
