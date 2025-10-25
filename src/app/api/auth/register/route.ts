import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { badRequestResponse, serverErrorResponse } from '@/lib/apiResponse';

type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as RegisterRequest;
    const { email, password, name } = body;

    // バリデーション
    if (!email || !password || !name) {
      return badRequestResponse('メールアドレス、パスワード、名前を入力してください');
    }

    // Supabase Authにユーザーを登録
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return badRequestResponse(authError?.message || 'ユーザー登録に失敗しました');
    }

    // データベースにユーザー情報を保存
    try {
      const user = await prisma.user.create({
        data: {
          id: authData.user.id,
          name: name,
        },
      });

      return NextResponse.json({ user }, { status: 201 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // TODO: Supabase Authに作成したユーザーを削除するクリーンアップ処理
      return serverErrorResponse('データベースへのユーザー作成に失敗しました');
    }
  } catch (error) {
    console.error('Registration error:', error);
    return serverErrorResponse('ユーザー登録に失敗しました');
  }
}