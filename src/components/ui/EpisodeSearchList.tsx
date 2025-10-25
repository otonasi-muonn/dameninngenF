'use client';

import { useState } from 'react';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { formatUtcDateTime } from '@/utils/date';

type Episode = {
  id: string;
  content: string;
  category?: string;
  created_at: Date | string;
  user: { name: string | null } | null;
  _count: { likes: number };
  likes: { user_id: string }[];
};

type Props = {
  episodes: Episode[];
  isLoggedIn: boolean;
};

export default function EpisodeSearchList({ episodes, isLoggedIn }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); 

  // 検索クエリでフィルタリング
  const filteredEpisodes = episodes.filter((episode) => {
    const matchesQuery = episode.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? (episode.category === selectedCategory) : true;
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
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
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
            <div 
              key={episode.id} 
              style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <p style={{ 
                fontSize: '15px', 
                lineHeight: '1.6',
                color: '#333',
                marginBottom: '12px'
              }}>
                {episode.content}
              </p>

              {/* カテゴリー表示 */}
              {episode.category && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor:
                      episode.category === '恋愛' ? '#ffe4e1' :
                      episode.category === '学校・仕事' ? '#e6f7ff' :
                      episode.category === '日常生活' ? '#fffbe6' :
                      episode.category === '人間関係' ? '#f0f0f0' :
                      '#f9f9f9',
                    color:
                      episode.category === '恋愛' ? '#c62828' :
                      episode.category === '学校・仕事' ? '#1565c0' :
                      episode.category === '日常生活' ? '#ef6c00' :
                      episode.category === '人間関係' ? '#555' :
                      '#333',
                  }}>
                    {episode.category}
                  </span>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px'
              }}>
                <small style={{
                  fontSize: '12px',
                  color: '#999',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: '500', color: '#666' }}>
                    👤 {episode.user?.name || '名無しさん'}
                  </span>
                  <span>
                    {formatUtcDateTime(episode.created_at)}
                  </span>
                </small>

                {/* ログインしている時だけいいねボタンを表示 */}
                {isLoggedIn && (
                  <LikeButton
                    episodeId={episode.id}
                    initialLikes={episode._count.likes}
                    isInitiallyLiked={episode.likes.length > 0}
                  />
                )}
              </div>

              {/* コメントセクション */}
              <CommentSection episodeId={episode.id} isLoggedIn={isLoggedIn} />
            </div>
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
  );
}