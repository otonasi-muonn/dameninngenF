import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { badRequestResponse, unauthorizedResponse } from '@/lib/apiResponse';

type LoginRequest = {
  email: string;
  password: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as LoginRequest;
    const { email, password } = body;

    if (!email || !password) {
      return badRequestResponse('メールアドレスとパスワードを入力してください');
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return unauthorizedResponse(error.message);
    }

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return unauthorizedResponse('ログインに失敗しました');
  }
}