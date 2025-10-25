import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { unauthorizedResponse, serverErrorResponse } from '@/lib/apiResponse';
import { DIAGNOSIS_HISTORY } from '@/lib/constants';

/**
 * ユーザーの診断履歴を取得する
 */
export async function GET(): Promise<NextResponse> {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const histories = await prisma.diagnosisHistory.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: DIAGNOSIS_HISTORY.MAX_ITEMS,
    });

    return NextResponse.json({ histories });
  } catch (error) {
    console.error('Failed to fetch diagnosis history:', error);
    return serverErrorResponse('診断履歴の取得に失敗しました');
  }
}
