'use client'; // ユーザー操作（入力など）を受け付けるので、クライアントコンポーネントにする

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // フォームが送信されたときの処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // フォーム送信時のページリロードを防ぐ
    setError(''); // 前のエラーメッセージをクリア

    // 先ほど作ったAPIにリクエストを送信
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      // 登録が成功したら、ログインページに遷移させる
      alert('登録が完了しました。ログインページに移動します。');
      router.push('/login');
    } else {
      // 登録が失敗したら、APIから返ってきたエラーメッセージを表示
      const data = await res.json();
      setError(data.error || '登録に失敗しました。');
    }
  };

  return (
    <div>
      <h1>ユーザー登録</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">ユーザー名:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ border: '1px solid black', marginLeft: '5px' }}
          />
        </div>
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
          登録
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}