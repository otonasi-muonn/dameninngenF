"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostForm() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/episodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setContent(''); // フォームを空にする
        // 投稿完了の UX は任意。ここでは簡易にアラートとページ更新
        alert('投稿しました！');
        router.refresh(); // ページを再読み込みして、新しい投稿を一覧に反映させる
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || '投稿に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      setError('投稿に失敗しました（通信エラー）。');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今日のダメ人間エピソードをどうぞ..."
        rows={4}
        maxLength={200}
        required
        style={{ width: '100%', border: '1px solid #333', padding: '8px', borderRadius: 4 }}
      />
      <button
        type="submit"
        style={{ marginTop: '10px', border: '1px solid #333', padding: '6px 12px', borderRadius: 4 }}
      >
        投稿する
      </button>
      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
    </form>
  );
}
