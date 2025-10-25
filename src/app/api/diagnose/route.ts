import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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
