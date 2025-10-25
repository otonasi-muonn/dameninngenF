'use client';

import { useState } from 'react';

type DiagnosisHistoryItem = {
  id: string;
  episode: string;
  diagnosis: string;
  created_at: string;
};

const MAX_TRUNCATE_LENGTH = 50;

export default function DiagnosisHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const [histories, setHistories] = useState<DiagnosisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistories = async () => {
    if (histories.length > 0) {
      setIsOpen(!isOpen);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/diagnosis-history');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '履歴の取得に失敗しました');
      }

      setHistories(data.histories);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '履歴の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const truncateText = (text: string, maxLength: number = MAX_TRUNCATE_LENGTH) => {
    return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* 診断履歴表示ボタン */}
      <button
        onClick={fetchHistories}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: loading
            ? '#ccc'
            : 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
          color: loading ? '#666' : '#2d3748',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(132, 250, 176, 0.3)',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(132, 250, 176, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(132, 250, 176, 0.3)';
          }
        }}
      >
        📜 {loading ? '読み込み中...' : isOpen ? '診断履歴を閉じる' : '診断履歴を表示'}
      </button>

      {/* エラー表示 */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#fee',
          borderRadius: '12px',
          color: '#c33',
          fontSize: '14px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 診断履歴リスト */}
      {isOpen && (
        <div style={{
          marginTop: '16px',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '2px solid #f0f0f0',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            📜 診断履歴
          </h2>

          {histories.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              診断履歴がありません
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {histories.map((item) => {
                const isExpanded = expandedId === item.id;
                
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '2px solid #f0f0f0',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* タイトル部分（クリック可能） */}
                    <div
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        padding: '16px 20px',
                        background: isExpanded 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : '#f8f9fa',
                        transition: 'all 0.3s',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: isExpanded ? 'white' : '#333',
                            marginBottom: '4px',
                          }}>
                            📝 {truncateText(item.episode, 50)}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: isExpanded ? 'rgba(255,255,255,0.8)' : '#999',
                          }}>
                            {formatDate(item.created_at)}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '20px',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                          color: isExpanded ? 'white' : '#667eea',
                        }}>
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* 展開内容 */}
                    {isExpanded && (
                      <div style={{
                        padding: '20px',
                        animation: 'slideDown 0.3s ease-out',
                      }}>
                        <div style={{
                          marginBottom: '16px',
                          padding: '16px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                        }}>
                          <strong style={{ color: '#667eea', fontSize: '14px' }}>
                            📝 エピソード
                          </strong>
                          <p style={{ 
                            margin: '8px 0 0 0', 
                            color: '#2d3748',
                            lineHeight: '1.6',
                            fontSize: '15px',
                          }}>
                            {item.episode}
                          </p>
                        </div>

                        <div style={{
                          padding: '16px',
                          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                          borderRadius: '8px',
                        }}>
                          <strong style={{ color: '#c44569', fontSize: '14px' }}>
                            🔮 診断結果
                          </strong>
                          <p style={{
                            margin: '8px 0 0 0',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.7',
                            color: '#2d3748',
                            fontSize: '15px',
                          }}>
                            {item.diagnosis}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
