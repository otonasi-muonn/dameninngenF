import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Next.jsのServer Component/Route HandlerでSupabaseを扱うためのお作法
  // これを使うと、認証成功時に自動でCookieにセッション情報を保存してくれる
  const supabase = createRouteHandlerClient({ cookies });

  // Supabase Authにメールアドレスとパスワードを渡してサインイン
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 認証でエラーが発生した場合 (パスワード間違いなど)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 }); // 401 Unauthorized
  }

  // 成功した場合は、Supabaseが自動でCookieを設定してくれるので、
  // ここでは単純に成功レスポンスを返すだけでOK
  return NextResponse.json({ message: 'Login successful' }, { status: 200 });
}