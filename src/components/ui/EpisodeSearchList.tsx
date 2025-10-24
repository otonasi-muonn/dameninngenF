'use client';

import { useState } from 'react';
import LikeButton from './LikeButton';
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
      <h2>みんなのダメ人間エピソード</h2>

      {/* 検索ボックス */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="エピソードを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '10px',
            fontSize: '16px',
            border: '2px solid #ccc',
            borderRadius: '4px',
          }}
        />
        {searchQuery && (
          <p style={{ marginTop: '10px', color: '#666' }}>
            {filteredEpisodes.length}件のエピソードが見つかりました
          </p>
        )}
      </div>

      {/* カテゴリー選択 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>カテゴリーで絞り込み:</label>
        <select
          value={selectedCategory ?? ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        >
          <option value="">すべて表示</option>
          <option value="恋愛">恋愛</option>
          <option value="学校・仕事">学校・仕事</option>
          <option value="日常生活">日常生活</option>
          <option value="人間関係">人間関係</option>
          <option value="その他">その他</option>
        </select>
      </div>

      {/* エピソード一覧 */}
      {filteredEpisodes.length > 0 ? (
  filteredEpisodes.map((episode) => (
    <div key={episode.id} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
      <p>{episode.content}</p>

      {/* カテゴリー表示 */}
      {episode.category && (
        <p style={{ marginBottom: '8px' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
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
        </p>
      )}



      <small>
        投稿者: {episode.user?.name || '名無しさん'} - {formatUtcDateTime(episode.created_at)}
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
  ))
) : (
  <p>該当するエピソードが見つかりませんでした。</p>
)}
</div>
  );
}