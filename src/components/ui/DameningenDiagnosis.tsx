'use client';

import { useState } from 'react';

export default function DameningenDiagnosis() {
  const [isOpen, setIsOpen] = useState(false);
  const [episode, setEpisode] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDiagnose = async () => {
    if (!episode.trim()) {
      setError('エピソードを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setDiagnosis('');

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '診断に失敗しました');
      }

      setDiagnosis(data.diagnosis);
    } catch (err) {
      setError(err instanceof Error ? err.message : '診断に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* 診断ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '20px 32px',
          background: isOpen 
            ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            : 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
          color: '#2d3748',
          border: 'none',
          borderRadius: '16px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s',
          boxShadow: isOpen 
            ? '0 8px 16px rgba(168, 237, 234, 0.4)'
            : '0 4px 12px rgba(251, 194, 235, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(168, 237, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isOpen 
            ? '0 8px 16px rgba(168, 237, 234, 0.4)'
            : '0 4px 12px rgba(251, 194, 235, 0.4)';
        }}
      >
        <span style={{ fontSize: '24px' }}>🔮</span>
        <span>ダメ人間度診断</span>
        <span style={{ 
          fontSize: '20px',
          transition: 'transform 0.3s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block'
        }}>
          ▼
        </span>
      </button>

      {/* 診断フォーム（折りたたみ可能） */}
      {isOpen && (
        <div style={{
          marginTop: '16px',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '2px solid #f0f0f0',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🔮 あなたのダメ人間度を診断します
          </h2>
          <p style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            あなたのダメ人間エピソードを入力してください。AIが診断します！
          </p>

          <textarea
            value={episode}
            onChange={(e) => setEpisode(e.target.value)}
            placeholder="例: 今日も朝10時に起きてしまった。目覚ましを5回スヌーズした..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid #e0e0e0',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#f093fb';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
            }}
          />

          <button
            onClick={handleDiagnose}
            disabled={loading || !episode.trim()}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: loading || !episode.trim() ? '#ccc' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: loading || !episode.trim() ? '#666' : '#2d3748',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading || !episode.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '16px',
            }}
            onMouseEnter={(e) => {
              if (!loading && episode.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(250, 112, 154, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && episode.trim()) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? '診断中...' : '診断する'}
          </button>

          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fee',
              borderRadius: '12px',
              color: '#c33',
              fontSize: '14px',
              marginBottom: '16px',
            }}>
              ⚠️ {error}
            </div>
          )}

          {diagnosis && (
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              borderRadius: '12px',
              border: '2px solid #f093fb',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#c44569',
              }}>
                📊 診断結果
              </h3>
              <div style={{
                whiteSpace: 'pre-wrap',
                lineHeight: '1.8',
                color: '#2d3748',
                fontSize: '15px',
              }}>
                {diagnosis}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
