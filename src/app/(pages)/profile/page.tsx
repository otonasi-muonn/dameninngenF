'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Profile = {
  name: string;
  email: string;
  bio: string;
  birthday: string | null;
  avatar_url: string;
  likes_count?: number;
  episodes_count?: number;
  titles?: string[];          // 配列に変更
  post_titles?: string[];     // 配列に変更
  following_count?: number;
  followers_count?: number;
};

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/profile', { cache: 'no-store' });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Failed to fetch profile: ${res.status} ${text}`);
        }
        const data: Profile = await res.json();

        setProfile(data);
        setName(data.name || '');
        setBio(data.bio || '');
        setBirthday(data.birthday ?? null);
        setAvatarPreview(data.avatar_url || '');
      } catch (e) {
        console.error('Profile fetch error:', e);
        setError('ユーザー情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router, supabase.auth]);

  const birthdayDisplay = useMemo(() => {
    if (!profile?.birthday) return '未設定';
    return new Date(profile.birthday).toLocaleDateString('ja-JP');
  }, [profile?.birthday]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (file.size > 500_000) {
      setError('画像サイズは500KB以下にしてください');
      e.target.value = '';
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      const compressedBase64 = await compressImage(file, 256, 256, 0.8);
      setAvatar(compressedBase64);
      setError('');
    } catch (err) {
      console.error('Image compression error:', err);
      setError('画像の処理に失敗しました');
    }
  };

  const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証されていません');

      const fd = new FormData();
      fd.append('name', name);
      fd.append('bio', bio);
      fd.append('birthday', birthday || '');
      if (avatar) fd.append('avatar', avatar);

      const res = await fetch('/api/profile', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('プロフィールの更新に失敗しました');

      const updated: Profile = await res.json();
      setProfile(updated);
      setIsEditing(false);
      setAvatar(null);
    } catch (e) {
      console.error('Update error:', e);
      setError(e instanceof Error ? e.message : 'プロフィールの更新に失敗しました');
    }
  };

  // 称号の見た目マップ
  const getTitleStyle = (title: string) => {
    switch (title) {
      case '神':                return { bg: 'bg-gradient-to-r from-yellow-400 via-red-400 to-pink-500 text-white shadow-lg', icon: '✨' };
      case 'カリスマ':          return { bg: 'bg-gradient-to-r from-purple-400 to-pink-400 text-white', icon: '💎' };
      case 'インフルエンサー':  return { bg: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white', icon: '🌟' };
      case 'エース':            return { bg: 'bg-gradient-to-r from-green-400 to-teal-400 text-white', icon: '🔥' };
      case 'レジェンド':        return { bg: 'bg-gradient-to-r from-purple-300 to-pink-300 text-purple-900', icon: '👑' };
      case 'スーパースター':    return { bg: 'bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-900', icon: '⭐' };
      case '人気者':            return { bg: 'bg-yellow-100 text-yellow-800', icon: '🏅' };
      case '伝説の語り部':      return { bg: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg', icon: '📜' };
      case 'エピソード王':      return { bg: 'bg-gradient-to-r from-violet-400 to-purple-500 text-white', icon: '📚' };
      case 'ストーリーテラー':  return { bg: 'bg-gradient-to-r from-pink-400 to-rose-400 text-white', icon: '🎭' };
      case 'エリート投稿者':    return { bg: 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white', icon: '🎖️' };
      case 'マスター投稿者':    return { bg: 'bg-gradient-to-r from-indigo-300 to-purple-300 text-indigo-900', icon: '🏆' };
      case 'ベテラン投稿者':    return { bg: 'bg-gradient-to-r from-blue-200 to-indigo-200 text-indigo-900', icon: '🎖️' };
      case '常連投稿者':        return { bg: 'bg-blue-100 text-blue-800', icon: '✍️' };
      // 追加
      case '初いいね獲得':      return { bg: 'bg-green-100 text-green-800', icon: '🎉' };
      case '初投稿':            return { bg: 'bg-teal-100 text-teal-800', icon: '🆕' };
      default:                  return { bg: 'bg-gray-100 text-gray-800', icon: '🔖' };
    }
  };

  if (!mounted) return null;
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }
  if (!profile) return null;

  const allTitles = [...(profile.titles ?? []), ...(profile.post_titles ?? [])];

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">プロフィール</h1>
            {!isEditing && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setName(profile.name);
                  setBio(profile.bio);
                  setBirthday(profile.birthday);
                  setAvatar(null);
                }}
                className="text-blue-500 hover:text-blue-600 transition-colors"
              >
                編集
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                <p className="text-xs text-gray-500">※ 500KB以下の画像を選択してください</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input type="email" value={profile.email} disabled className="w-full p-2 border rounded bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ユーザーネーム</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={150}
                  className="w-full p-2 border rounded resize-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-500">{bio.length}/150</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">誕生日</label>
                <input
                  type="date"
                  value={birthday ?? ''}
                  onChange={(e) => setBirthday(e.target.value || null)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {/* アバターの下に称号バッジ */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>

                {/* すべての称号を表示 */}
                {allTitles.length > 0 && (
                  <div className="flex justify-center gap-2 flex-wrap">
                    {allTitles.map((t, idx) => {
                      const style = getTitleStyle(t);
                      return (
                        <span key={idx} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${style.bg}`}>
                          {style.icon} {t}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* フォロー数/フォロワー数 */}
                {(typeof profile.following_count === 'number' || typeof profile.followers_count === 'number') && (
                  <div className="flex items-center justify-center gap-8 text-sm">
                    <div className="text-indigo-600 font-semibold">
                      フォロー中 <span className="ml-1 text-xl">{profile.following_count ?? 0}</span>
                    </div>
                    <div className="text-pink-700 font-semibold">
                      フォロワー <span className="ml-1 text-xl">{profile.followers_count ?? 0}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <div className="p-2 bg-gray-50 rounded">{profile.email}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ユーザーネーム</label>
                <div className="p-2 bg-gray-50 rounded">{profile.name || '未設定'}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
                <div className="p-2 bg-gray-50 rounded whitespace-pre-wrap">
                  {profile.bio || '未設定'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">誕生日</label>
                <div className="p-2 bg-gray-50 rounded">{birthdayDisplay}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}