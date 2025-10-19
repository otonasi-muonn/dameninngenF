'use client'; // ボタンのクリックを扱うのでクライアントコンポーネント

import { useState } from 'react';

type LikeButtonProps = {
  episodeId: string;
  initialLikes: number;
  isInitiallyLiked: boolean;
};

export default function LikeButton({ episodeId, initialLikes, isInitiallyLiked }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);

  const handleLike = async () => {
    // APIにリクエストを送信
    const res = await fetch(`/api/episodes/${episodeId}/like`, {
      method: 'POST',
    });

    if (res.ok) {
      // 画面上の表示を即座に更新
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
      // router.refresh(); // ページ全体をリフレッシュすると重いので、今回はUIの即時更新で対応
    } else {
      alert('いいねに失敗しました。');
    }
  };

  return (
    <button
      onClick={handleLike}
      style={{
        marginTop: '10px',
        border: '1px solid black',
        padding: '5px',
        // いいねしていたら色を変える
        backgroundColor: isLiked ? 'pink' : 'white',
      }}
    >
      👍 {likes}
    </button>
  );
}