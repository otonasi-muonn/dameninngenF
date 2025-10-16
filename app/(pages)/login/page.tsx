'use client'; // ユーザー操作を受け付けるので、クライアントコンポーレントにする

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // フォームが送信されたときの処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ページリロードを防ぐ
    setError('');

    // ログインAPIにリクエストを送信
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      // ログインが成功したら、トップページに遷移させる
      router.push('/');
      router.refresh(); // サーバー側の状態を更新して、ログイン状態をページに反映させる
    } else {
      // 失敗したらエラーメッセージを表示 (例: パスワード間違い)
      const data = await res.json();
      setError(data.error || 'ログインに失敗しました。');
    }
  };

  return (
    <div>
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="email">メールアドレス:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ border: '1px solid black', marginLeft: '5px' }}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="password">パスワード:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ border: '1px solid black', marginLeft: '5px' }}
          />
        </div>
        <button type="submit" style={{ marginTop: '20px', border: '1px solid black', padding: '5px' }}>
          ログイン
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}