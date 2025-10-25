import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

type DiagnosisHistoryItem = {
  id: string;
  user_id: string;
  episode: string;
  diagnosis: string;
  created_at: Date;
};

type HistoryResponse = {
  histories: DiagnosisHistoryItem[];
};

type ErrorResponse = {
  error: string;
};

const MAX_HISTORY_ITEMS = 50;

/**
 * 認証されたユーザーを取得する
 */
async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * ユーザーの診断履歴を取得する
 */
export async function GET(): Promise<NextResponse<HistoryResponse | ErrorResponse>> {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const histories = await prisma.diagnosisHistory.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: MAX_HISTORY_ITEMS,
    });

    return NextResponse.json({ histories });
  } catch (error) {
    console.error('Failed to fetch diagnosis history:', error);
    return NextResponse.json(
      { error: '診断履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}
