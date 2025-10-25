import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { isOwner } from '@/lib/auth';
import { unauthorizedResponse, notFoundResponse, forbiddenResponse, serverErrorResponse } from '@/lib/apiResponse';

/**
 * エピソードを削除する
 * DELETE /api/episodes/[episode_id]
 * 
 * 権限チェック:
 * - 認証済みユーザーのみ
 * - 投稿者本人のみ削除可能
 * 
 * Cascadeで自動削除:
 * - 関連するLike
 * - 関連するComment
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ episode_id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const { episode_id } = await params;

    // エピソードが存在するか確認
    const episode = await prisma.episode.findUnique({
      where: { id: episode_id },
      select: { user_id: true }
    });

    if (!episode) {
      return notFoundResponse('エピソードが見つかりません');
    }

    // 投稿者本人かチェック
    if (!isOwner(user.id, episode.user_id)) {
      return forbiddenResponse('自分の投稿のみ削除できます');
    }

    // エピソードを削除（関連するlike、commentもCascadeで削除される）
    await prisma.episode.delete({
      where: { id: episode_id }
    });

    return NextResponse.json({ message: 'エピソードを削除しました' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete episode:', error);
    return serverErrorResponse('エピソードの削除に失敗しました');
  }
}
