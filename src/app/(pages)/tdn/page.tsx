'use client';

import { useState, useEffect } from 'react';

type Episode = {
  id: string;
  content: string;
  created_at: Date;
  user: { name: string } | null;
  _count: { likes: number };
};

type TdnHistoryItem = {
  date: string;
  episode: Episode | null;
  likes: number;
};

export default function TdnPage() {
  const [tdn, setTdn] = useState<Episode | null>(null);
  const [tdnHistory, setTdnHistory] = useState<TdnHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 今日のTDNを取得
  useEffect(() => {
    async function fetchTdn() {
      try {
        const res = await fetch('/api/tdn');
        if (res.ok) {
          const data = await res.json();
          setTdn(data);
        }
      } catch (error) {
        console.error('Failed to fetch TDN:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTdn();
  }, []);

  // 過去のTDNを取得
  const fetchTdnHistory = async () => {
    if (tdnHistory.length > 0) {
      // 既に取得済みの場合は表示を切り替えるだけ
      setShowHistory(!showHistory);
      return;
    }

    setHistoryLoading(true);
    try {
      const res = await fetch('/api/tdn/history');
      if (res.ok) {
        const data = await res.json();
        setTdnHistory(data);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Failed to fetch TDN history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 16 }}>読み込み中...</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>👑 今日のダメ人間 (TDN) 👑</h1>

      {tdn ? (
        <div style={{ border: '2px solid gold', backgroundColor: '#fffacd', padding: 20, borderRadius: 8, margin: '20px 0' }}>
          <h2 style={{ marginTop: 0, color: '#b8860b' }}>{tdn.content}</h2>
          <div style={{ marginTop: 15 }}>
            <p><strong>投稿者:</strong> {tdn.user?.name || '名無しさん'}</p>
            <p><strong>いいね数:</strong> {tdn._count.likes}</p>
            <p><strong>投稿日時:</strong> {new Date(tdn.created_at).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, backgroundColor: '#f9f9f9' }}>
          <p>今日のダメ人間はまだいません。</p>
          <p>あなたが初代TDNになるチャンス！</p>
        </div>
      )}

      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>
          TDNは24時間以内に最もいいねを獲得したエピソードです
        </p>

        {/* 過去のTDNを見るボタン */}
        <button
          onClick={fetchTdnHistory}
          disabled={historyLoading}
          style={{
            marginTop: 20,
            padding: '10px 20px',
            backgroundColor: '#b8860b',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: historyLoading ? 'wait' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {historyLoading ? '読み込み中...' : showHistory ? '過去のTDNを隠す' : '過去のTDNを見る'}
        </button>
      </div>

      {/* 過去のTDN一覧 */}
      {showHistory && (
        <div style={{ marginTop: 40 }}>
          <h2>📜 過去のTDN履歴</h2>
          {tdnHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tdnHistory.map((item) => (
                <div
                  key={item.date}
                  style={{
                    border: '1px solid #daa520',
                    backgroundColor: '#fffef0',
                    padding: 16,
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    borderBottom: '1px solid #daa520',
                    paddingBottom: 8,
                  }}>
                    <span style={{ fontWeight: 'bold', color: '#b8860b' }}>
                      📅 {new Date(item.date).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      ❤️ {item.likes} いいね
                    </span>
                  </div>
                  {item.episode && (
                    <div>
                      <p style={{ margin: '8px 0', fontSize: '16px' }}>{item.episode.content}</p>
                      <small style={{ color: '#666' }}>
                        投稿者: {item.episode.user?.name || '名無しさん'}
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>
              過去のTDN履歴がありません
            </p>
          )}
        </div>
      )}
    </div>
  );
}
