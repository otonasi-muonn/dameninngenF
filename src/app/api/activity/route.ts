import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getUserActivity } from '@/lib/activity';
import { unauthorizedResponse, serverErrorResponse } from '@/lib/apiResponse';

// 定数定義
const DAYS_TO_SHOW = 365;

/**
 * 日付文字列をYYYY-MM-DD形式で取得
 */
const getDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * ユーザーのアクティビティデータを取得
 * GET /api/activity
 * 
 * レスポンス:
 * - 過去365日の日付ごとの投稿数といいね数の合計
 * - GitHubスタイルカレンダー表示用
 */
export async function GET(): Promise<NextResponse> {
  try {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    // 過去365日のデータを取得
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (DAYS_TO_SHOW - 1));
    startDate.setHours(0, 0, 0, 0);

    // DB側で集計を行う共通ロジックを利用
    const activities = await getUserActivity(user.id);
    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch activity data:', error);
    return serverErrorResponse('アクティビティデータの取得に失敗しました');
  }
}
