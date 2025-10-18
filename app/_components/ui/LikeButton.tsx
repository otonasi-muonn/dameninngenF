'use client'

import { useState } from 'react'

type LikeButtonProps = {
  episodeId: string
  initialLikes: number
  isInitiallyLiked: boolean
}

export default function LikeButton({
  episodeId,
  initialLikes,
  isInitiallyLiked,
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(isInitiallyLiked)
  const [isClicked, setIsClicked] = useState(false) // アニメーション用

  const handleLike = async () => {
    // UIを即座に更新（オプティミスティックアップデート）
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 300) // アニメーションの状態をリセット

    // APIにリクエストを送信
    const res = await fetch(`/api/episodes/${episodeId}/like`, {
      method: 'POST',
    })

    if (!res.ok) {
      // エラーが発生した場合はUIを元に戻す
      setIsLiked(isLiked)
      setLikes(likes)
      alert('いいねに失敗しました。')
    }
  }

  // --- スタイル定義 ---
  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '999px', // 丸み
    cursor: 'pointer',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    userSelect: 'none',
  }

  // いいね済みのスタイル
  const likedStyle: React.CSSProperties = {
    background: '#transparent' ,//透明 
    color: '#888',
    boxShadow: 'none',
  }

  // 未いいねのスタイル
  const unlikedStyle: React.CSSProperties = {
    background: '#transparent',
    color: '#888',
    border: 'none',
  }

  // ハートアイコンのスタイル
  const heartStyle: React.CSSProperties = {
    fontSize: '1rem',
    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    transform: isClicked ? 'scale(1.5)' : 'scale(1)', // クリック時に拡大
  }

  return (
    <button
      onClick={handleLike}
      style={{
        ...buttonStyle,
        ...(isLiked ? likedStyle : unlikedStyle),
      }}
      // ホバー時に少し拡大するエフェクト
      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={heartStyle}>{isLiked ? '❤️' : '♡'}</span>
      <span>{likes}</span>
    </button>
  )
}