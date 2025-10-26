import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserActivity } from '@/lib/activity';
import { notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

// 定数定義
const DAYS_TO_SHOW = 365;

/**
 * 日付文字列をYYYY-MM-DD形式で取得
 */
const getDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * 特定ユーザーのアクティビティデータを取得
 * GET /api/user/[id]/activity
 * 
 * レスポンス:
 * - 過去365日の日付ごとの投稿数といいね数の合計
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params;

    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      return notFoundResponse('ユーザーが見つかりません');
    }

    // 過去365日のデータを取得
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (DAYS_TO_SHOW - 1));
    startDate.setHours(0, 0, 0, 0);

    // DB側で集計を行う共通ロジックを利用
    const activities = await getUserActivity(userId);
    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch user activity data:', error);
    return serverErrorResponse('アクティビティデータの取得に失敗しました');
  }
}
