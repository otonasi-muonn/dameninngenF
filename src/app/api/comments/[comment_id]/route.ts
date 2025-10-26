import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { isOwner } from '@/lib/auth';
import { unauthorizedResponse, notFoundResponse, forbiddenResponse, serverErrorResponse } from '@/lib/apiResponse';

/**
 * コメントを削除する
 * DELETE /api/comments/[comment_id]
 * 
 * 権限チェック:
 * - 認証済みユーザーのみ
 * - コメント投稿者本人のみ削除可能
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ comment_id: string }> }
): Promise<NextResponse> {
  try {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const { comment_id } = await params;

    // コメントが存在するか確認
    const comment = await prisma.comment.findUnique({
      where: { id: comment_id },
      select: { user_id: true }
    });

    if (!comment) {
      return notFoundResponse('コメントが見つかりません');
    }

    // コメント投稿者本人かチェック
    if (!isOwner(user.id, comment.user_id)) {
      return forbiddenResponse('自分のコメントのみ削除できます');
    }

    // コメントを削除
    await prisma.comment.delete({
      where: { id: comment_id }
    });

    return NextResponse.json({ message: 'コメントを削除しました' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return serverErrorResponse('コメントの削除に失敗しました');
  }
}
