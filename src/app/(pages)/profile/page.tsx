'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Profile = {
  name: string;
  email: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 認証済みユーザー情報を取得
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }

        if (!user) {
          router.push('/login');
          return;
        }

        // プロフィール情報を取得
        const res = await fetch('/api/profile');
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        setProfile({
          name: data.name || '',
          email: user.email || '',
        });
        setName(data.name || '');
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('ユーザー情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('認証されていません');
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      const updatedProfile = await res.json();
      setProfile(prev => ({
        ...prev!,
        name: updatedProfile.name
      }));
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'プロフィールの更新に失敗しました');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">プロフィール</h1>
            {!isEditing && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setName(profile.name);
                }}
                className="text-blue-500 hover:text-blue-600 transition-colors"
              >
                編集
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス:
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full p-2 border rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ユーザーネーム:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス:
                </label>
                <div className="p-2 bg-gray-50 rounded">{profile.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ユーザーネーム:
                </label>
                <div className="p-2 bg-gray-50 rounded">{profile.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}