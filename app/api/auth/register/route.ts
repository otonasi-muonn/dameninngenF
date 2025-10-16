import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  // フロントエンドから送られてきたemail, password, nameを取得
  const { email, password, name } = await request.json();

  // --- 処理1: Supabase Authにユーザーを登録 ---
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  // Supabase Authでエラーが出たら、その時点で処理を中断してエラーを返す
  if (authError || !authData.user) {
    // 400 Bad Request: クライアントからのリクエストが不正（例: 同じメールアドレスが既に存在）
    return NextResponse.json({ error: authError?.message || 'Authentication failed' }, { status: 400 });
  }

  // --- 処理2: 自分のデータベース(PostgreSQL)にもユーザー情報を保存 ---
  try {
    // Supabase AuthのIDと連携させるのが超重要！
    const user = await prisma.user.create({
      data: {
        id: authData.user.id, // Supabase Authが発行したIDをそのまま使う
        name: name,
      },
    });

    // 成功したら、作成したユーザー情報を返す (ステータス 201 Created)
    return NextResponse.json({ user }, { status: 201 });
  } catch (dbError) {
    // DBへの保存でエラーが起きた場合 (例: ネットワークエラー)
    console.error(dbError);
    // TODO: 本来はここでSupabase Authに作成したユーザーを削除するクリーンアップ処理を入れるのが望ましい
    // 500 Internal Server Error: サーバー側で予期せぬ問題が発生
    return NextResponse.json({ error: 'Failed to create user in database' }, { status: 500 });
  }
}