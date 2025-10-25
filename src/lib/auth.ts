import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

/**
 * 認証されたユーザーを取得する
 * @returns ユーザー情報またはnull
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * ユーザーが認証されているかチェック
 * @returns 認証済みの場合true
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  return user !== null;
}

/**
 * リソースの所有者かチェック
 * @param userId - チェックするユーザーID
 * @param resourceOwnerId - リソースの所有者ID
 * @returns 所有者の場合true
 */
export function isOwner(userId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId;
}

