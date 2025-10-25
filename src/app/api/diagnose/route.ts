import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

type DiagnoseRequest = {
  episode: string;
};

type DiagnoseResponse = {
  diagnosis: string;
};

type ErrorResponse = {
  error: string;
};

/**
 * 診断履歴を保存する
 */
async function saveDiagnosisHistory(
  userId: string, 
  episode: string, 
  diagnosis: string
): Promise<void> {
  try {
    await prisma.diagnosisHistory.create({
      data: {
        user_id: userId,
        episode,
        diagnosis,
      },
    });
  } catch (error) {
    console.error('Failed to save diagnosis history:', error);
  }
}

/**
 * Gemini APIで診断を実行する
 */
async function generateDiagnosis(episode: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
あなたはユーモアのある診断士です。以下のエピソードを読んで、その人の「ダメ人間度」を0%から100%で診断してください。
診断は楽しく、ポジティブなトーンで行ってください。

エピソード: ${episode}

以下の形式で回答してください：
- ダメ人間度: XX%
- 診断結果: （2-3文で、ユーモアを交えた診断コメント）
- アドバイス: （1-2文で、前向きなアドバイス）
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * 認証されたユーザーを取得する
 */
async function getAuthenticatedUser() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<DiagnoseResponse | ErrorResponse>> {
  const ip = getClientIp(request.headers);
  const { allowed } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: '診断回数の上限に達しました。1分後に再度お試しください。' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json() as DiagnoseRequest;
    const { episode } = body;

    if (!episode || typeof episode !== 'string' || episode.trim().length === 0) {
      return NextResponse.json(
        { error: 'エピソードを入力してください' },
        { status: 400 }
      );
    }

    const diagnosis = await generateDiagnosis(episode);
    const user = await getAuthenticatedUser();

    if (user) {
      await saveDiagnosisHistory(user.id, episode, diagnosis);
    }

    return NextResponse.json({ diagnosis });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: '診断に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
