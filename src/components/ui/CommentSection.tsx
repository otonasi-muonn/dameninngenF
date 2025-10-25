'use client';

import { useState, useEffect } from 'react';

type Comment = {
  id: string;
  content: string;
  created_at: Date;
  user: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
};

type CommentSectionProps = {
  episodeId: string;
  isLoggedIn: boolean;
};

export default function CommentSection({ episodeId, isLoggedIn }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, episodeId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/episodes/${episodeId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/episodes/${episodeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setNewComment('');
      } else {
        const error = await response.json();
        alert(error.error || 'コメントの投稿に失敗しました');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('コメントの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={() => setShowComments(!showComments)}
        style={{
          background: 'none',
          border: 'none',
          color: '#666',
          fontSize: '14px',
          cursor: 'pointer',
          padding: '5px 0',
          textDecoration: 'underline'
        }}
      >
        {showComments ? '💬 コメントを隠す' : `💬 コメント (${comments.length})`}
      </button>

      {showComments && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
          {isLoading ? (
            <p style={{ color: '#999', fontSize: '14px' }}>読み込み中...</p>
          ) : (
            <>
              {/* コメント一覧 */}
              {comments.length === 0 ? (
                <p style={{ color: '#999', fontSize: '14px', marginBottom: '15px' }}>
                  まだコメントがありません
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                  {comments.map((comment) => (
                    <div key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                      {/* アバター */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {comment.user.avatar_url ? (
                          <img
                            src={comment.user.avatar_url}
                            alt={comment.user.name || '名無しさん'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '16px' }}>👤</span>
                        )}
                      </div>

                      {/* コメント内容 */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            {comment.user.name || '名無しさん'}
                          </span>
                          <span style={{ color: '#999', fontSize: '12px' }}>
                            {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* コメント入力フォーム */}
              {isLoggedIn ? (
                <form onSubmit={handleSubmit}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="コメントを入力..."
                    maxLength={500}
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {newComment.length}/500
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: newComment.trim() && !isSubmitting ? '#007bff' : '#ccc',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: newComment.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold'
                      }}
                    >
                      {isSubmitting ? '送信中...' : 'コメント'}
                    </button>
                  </div>
                </form>
              ) : (
                <p style={{ color: '#999', fontSize: '14px' }}>
                  コメントするにはログインしてください
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
