'use client';

import { useState } from 'react';
import LikeButton from './LikeButton';
import { formatUtcDateTime } from '@/utils/date';
import CommentForm from '@/components/ui/CommentForm';

type Episode = {
  id: string;
  content: string;
  category?: string;
  created_at: Date | string;
  user: { name: string | null } | null;
  _count: { likes: number };
  likes: { user_id: string }[];
  comments: {
    id: string;
    content: string;
    user?: { name?: string | null } | null;
  }[];
};

type Props = {
  episodes: Episode[];
  isLoggedIn: boolean;
};

function EpisodeCard({ episode, isLoggedIn }: { episode: Episode; isLoggedIn: boolean }) {
  const [comments, setComments] = useState(episode.comments || []);

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
      <p>{episode.content}</p>

      <div style={{ marginTop: 16 }}>
        {comments.map((comment) => (
          <div key={comment.id} style={{ marginTop: 8, padding: 8, backgroundColor: '#f1f1f1', borderRadius: 4 }}>
            <p style={{ margin: 0, fontSize: 14 }}>
              <strong>{comment.user?.name || '名無しさん'}:</strong> {comment.content}
            </p>
          </div>
        ))}
      </div>

      {isLoggedIn && (
        <CommentForm
          episodeId={episode.id}
          onCommentAdded={(newComment) => setComments((prev) => [...prev, newComment])}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <small style={{ fontSize: 12, color: '#999', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontWeight: 500, color: '#666' }}>👤 {episode.user?.name || '名無しさん'}</span>
          <span>{formatUtcDateTime(episode.created_at)}</span>
        </small>
        {isLoggedIn && (
          <LikeButton
            episodeId={episode.id}
            initialLikes={episode._count.likes}
            isInitiallyLiked={episode.likes.length > 0}
          />
        )}
      </div>
    </div>
  );
}

export default function EpisodeSearchList({ episodes, isLoggedIn }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEpisodes = episodes.filter((episode) => {
    const matchesQuery = episode.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? episode.category === selectedCategory : true;
    return matchesQuery && matchesCategory;
  });

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '24px',
        color: '#333'
      }}>
        みんなのダメ人間エピソード
      </h2>

      {/* 検索ボックス */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 エピソードを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: '1',
            minWidth: '250px',
            padding: '12px 16px',
            fontSize: '14px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
        />

        <select
          value={selectedCategory ?? ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="">📁 すべてのカテゴリー</option>
          <option value="恋愛">💕 恋愛</option>
          <option value="学校・仕事">📚 学校・仕事</option>
          <option value="日常生活">🏠 日常生活</option>
          <option value="人間関係">👥 人間関係</option>
          <option value="その他">📝 その他</option>
        </select>
      </div>

      {searchQuery && (
        <p style={{
          marginBottom: '16px',
          color: '#667eea',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          🔍 {filteredEpisodes.length}件のエピソードが見つかりました
        </p>
      )}

      {/* エピソード一覧 */}
      <div style={{
        display: 'grid',
        gap: '16px',
        marginTop: '20px'
      }}>
        {filteredEpisodes.length > 0 ? (
          filteredEpisodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} isLoggedIn={isLoggedIn} />
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999',
            background: 'white',
            borderRadius: '12px',
            border: '2px dashed #e0e0e0'
          }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>
              該当するエピソードが見つかりませんでした
            </p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              検索条件を変更してみてください
            </p>
          </div>
        )}
      </div>
    </div>
  );'use client';
}