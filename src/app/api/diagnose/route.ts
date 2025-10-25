import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getAuthenticatedUser } from '@/lib/auth';
import { badRequestResponse, rateLimitResponse, serverErrorResponse } from '@/lib/apiResponse';
import { EPISODE_CONSTRAINTS, GEMINI_CONFIG } from '@/lib/constants';

type DiagnoseRequest = {
  episode: string;
};

/**
 * 診断履歴を保存する
 * @param userId - ユーザーID
 * @param episode - エピソード
 * @param diagnosis - 診断結果
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
    // 履歴保存の失敗はログに記録するが、診断処理は継続
    console.error('Failed to save diagnosis history:', error);
  }
}

/**
 * Gemini APIで診断を実行する
 * @param episode - 診断するエピソード
 * @returns 診断結果
 */
async function generateDiagnosis(episode: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });

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
  const text = result.response.text();
  
  if (!text) {
    throw new Error('Empty response from AI');
  }
  
  return text;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const { allowed } = checkRateLimit(ip);

  if (!allowed) {
    return rateLimitResponse('診断回数の上限に達しました。1分後に再度お試しください。');
  }

  try {
    const body = await request.json() as DiagnoseRequest;
    const { episode } = body;

    // バリデーション
    if (!episode || typeof episode !== 'string') {
      return badRequestResponse('エピソードを入力してください');
    }

    const trimmedEpisode = episode.trim();
    
    if (trimmedEpisode.length === 0) {
      return badRequestResponse('エピソードを入力してください');
    }

    if (trimmedEpisode.length < EPISODE_CONSTRAINTS.MIN_LENGTH) {
      return badRequestResponse(`エピソードは${EPISODE_CONSTRAINTS.MIN_LENGTH}文字以上で入力してください`);
    }

    if (trimmedEpisode.length > EPISODE_CONSTRAINTS.MAX_LENGTH) {
      return badRequestResponse(`エピソードは${EPISODE_CONSTRAINTS.MAX_LENGTH}文字以内で入力してください`);
    }

    const diagnosis = await generateDiagnosis(trimmedEpisode);
    const user = await getAuthenticatedUser();

    // 認証済みユーザーの場合のみ履歴を保存
    if (user) {
      await saveDiagnosisHistory(user.id, trimmedEpisode, diagnosis);
    }

    return NextResponse.json({ diagnosis });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return serverErrorResponse('診断に失敗しました。もう一度お試しください。');
  }
}
