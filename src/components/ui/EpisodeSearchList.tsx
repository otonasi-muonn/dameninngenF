'use client';

import { useState } from 'react';
import LikeButton from './LikeButton';
import { formatUtcDateTime } from '@/utils/date';

type Episode = {
  id: string;
  content: string;
  created_at: Date;
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

  // 検索クエリでフィルタリング
  const filteredEpisodes = episodes.filter((episode) =>
    episode.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* エピソード一覧 */}
      {filteredEpisodes.length > 0 ? (
        filteredEpisodes.map((episode) => (
          <div key={episode.id} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
            <p>{episode.content}</p>
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