import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// レート制限の設定
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分
const RATE_LIMIT_MAX_REQUESTS = 10; // 1分間に10回まで

// IPアドレスごとのリクエスト履歴を保存
const requestHistory = new Map<string, number[]>();

// レート制限をチェックする関数
function checkRateLimit(ip: string): { allowed: boolean; remainingRequests: number } {
  const now = Date.now();
  const userRequests = requestHistory.get(ip) || [];

  // 1分以内のリクエストのみをフィルタリング
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remainingRequests: 0 };
  }

  // 新しいリクエストを追加
  recentRequests.push(now);
  requestHistory.set(ip, recentRequests);

  return { allowed: true, remainingRequests: RATE_LIMIT_MAX_REQUESTS - recentRequests.length };
}

export async function POST(request: NextRequest) {
  // IPアドレスを取得
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // レート制限をチェック
  const { allowed, remainingRequests } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: '診断回数の上限に達しました。1分後に再度お試しください。' },
      { status: 429 }
    );
  }
  try {
    const { episode } = await request.json();

    if (!episode || typeof episode !== 'string') {
      return NextResponse.json(
        { error: 'エピソードを入力してください' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 500 }
      );
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
    const diagnosis = result.response.text();

    return NextResponse.json({ diagnosis });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: '診断に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
