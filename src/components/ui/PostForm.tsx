"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostForm() {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('恋愛'); // ← ① カテゴリー用のstateを追加
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
        // ← ② categoryも一緒に送信！
        body: JSON.stringify({ content, category }),
      });

      if (res.ok) {
        setContent('');
        setCategory('恋愛'); // ← 投稿後、選択をリセット
        alert('投稿しました！');
        router.refresh();
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
    <form onSubmit={handleSubmit} style={{ marginTop: '20px',
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', }}>
      {/* 投稿内容 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今日のダメ人間エピソードをどうぞ..."
        rows={4}
        maxLength={200}
        required
        style={{ width: '100%',
    border: '1px solid #ccc',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    lineHeight: '1.5',
    resize: 'vertical',
    backgroundColor: '#fff', }}
      />

      {/* ③ カテゴリー選択を追加 */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          width: '100%',
    marginTop: '12px',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: category === '恋愛' ? '#ffe4e1' :
      category === '学校・仕事' ? '#e6f7ff' :
      category === '日常生活' ? '#fffbe6' :
      category === '人間関係' ? '#e0f7e9' :
      '#eeeeee',
        }}
      >
        <option value="日常生活">🏠日常生活</option>
        <option value="学校・仕事">🏫学校・仕事</option>
        <option value="恋愛">💖恋愛</option>
        <option value="人間関係">👥人間関係</option>
        <option value="その他">🙅その他</option>
      </select>

      <button
        type="submit"
        style={{
          marginTop: '16px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
        }}
      >
        投稿する
      </button>

      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
    </form>
  );
}
