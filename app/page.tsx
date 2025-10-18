'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import LikeButton from './_components/ui/LikeButton';

type Episode = {
  id: string;
  content: string;
  created_at: Date;
  user: { name: string } | null;
  _count: { likes: number };
  likes: { user_id: string }[];
};

type TDN = {
  id: string;
  content: string;
  user: { name: string } | null;
  _count: { likes: number };
} | null;

type User = {
  name: string;
} | null;

export default function HomePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [tdn, setTdn] = useState<TDN>(null);
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadData() {
      try {
        // セッション情報を取得
        const { data: { session: userSession } } = await supabase.auth.getSession();
        setSession(userSession);

        // データを並行して取得
        const [episodesRes, tdnRes, userRes] = await Promise.all([
          fetch('/api/episodes?limit=100').then(r => r.json()),
          fetch('/api/tdn').then(r => r.json()),
          userSession ? fetch('/api/user').then(r => r.json()) : Promise.resolve(null)
        ]);

        // /api/episodesのレスポンス形式を変換
        const episodesData = (episodesRes.items || []).map((item: any) => ({
          id: item.id,
          content: item.content,
          created_at: item.created_at,
          user: item.user_name ? { name: item.user_name } : null,
          _count: { likes: item.likes },
          likes: item.likedByMe ? [{ user_id: userSession?.user?.id }] : []
        }));

        setEpisodes(episodesData);
        // /api/tdnはエピソードオブジェクトを直接返すか、404を返す
        setTdn(tdnRes && !tdnRes.message ? tdnRes : null);
        setCurrentUser(userRes?.user || null);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 検索クエリでフィルタリング
  const filteredEpisodes = episodes.filter((episode) =>
    episode.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h1>今日のダメ人間度管理アプリ (仮)</h1>

      {/* TDN表示エリア */}
      <div style={{ border: '2px solid gold', padding: '20px', margin: '20px 0', backgroundColor: '#fffacd' }}>
        <h2>👑 今日のダメ人間 (TDN) 👑</h2>
        {tdn ? (
          <div>
            <h3>{tdn.content}</h3>
            <p>投稿者: {tdn.user?.name || '名無しさん'}</p>
            <p>いいね数: {tdn._count.likes}</p>
          </div>
        ) : (
          <p>今日のダメ人間はまだいません。あなたが初代TDNになるチャンス！</p>
        )}
        <div style={{ marginTop: '15px' }}>
          <Link href="/tdn" style={{ color: '#b8860b', textDecoration: 'underline' }}>
            詳細を見る
          </Link>
        </div>
      </div>

      {/* ログイン状態による表示切り替え */}
      {session ? (
        <div>
          <p>ようこそ、{currentUser?.name || session.user.email} さん</p>
          <form action="/login" method="post" style={{ display: 'inline', marginLeft: '20px' }}>
            <button type="submit" style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>
              ログアウト
            </button>
          </form>
          <div style={{ marginTop: '20px' }}>
            <Link href="/episodes" style={{ color: 'blue', textDecoration: 'underline' }}>
              エピソードを投稿する
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p>投稿やいいねをするにはログインが必要です。</p>
          <Link href="/login" style={{ color: 'blue' }}>ログインページへ</Link>
        </div>
      )}

      {/* エピソード一覧 */}
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
                投稿者: {episode.user?.name || '名無しさん'} - {new Date(episode.created_at).toLocaleString()}
              </small>

              {/* ログインしている時だけいいねボタンを表示 */}
              {session && (
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
    </div>
  );
}