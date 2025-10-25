// components/ui/CommentForm.tsx
'use client';
import { useState } from 'react';


export default function CommentForm({
  episodeId,
  onCommentAdded,
}: {
  episodeId: string;
  onCommentAdded?: (newComment: { id: string; content: string; user?: { name?: string | null } }) => void;
}) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const res = await fetch('/api/comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ content, episodeId }),
});

if (!res.ok) {
  const errorText = await res.text();
  console.error('コメント送信失敗:', res.status, errorText);
  return;
}

const newComment = await res.json();

    setContent('');

    if (onCommentAdded) {
      onCommentAdded(newComment);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
  <textarea
    value={content}
    onChange={(e) => setContent(e.target.value)}
    placeholder="コメントを書く..."
    rows={3}
    style={{
      width: '100%',
      padding: '12px 16px',
      fontSize: '14px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      resize: 'vertical',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
    }}
    onFocus={(e) => e.target.style.borderColor = '#667eea'}
    onBlur={(e) => e.target.style.borderColor = '#ccc'}
  />

  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
    <button
      type="submit"
      disabled={!content.trim()}
      style={{
        padding: '8px 16px',
        backgroundColor: content.trim() ? '#667eea' : '#ccc',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: content.trim() ? 'pointer' : 'not-allowed',
        transition: 'background-color 0.2s'
      }}
    >
      💬 コメント送信
    </button>
  </div>
</form>

  );
}
