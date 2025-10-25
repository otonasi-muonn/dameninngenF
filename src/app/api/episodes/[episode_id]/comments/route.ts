import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { unauthorizedResponse, badRequestResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

type CommentCreateRequest = {
  content: string;
};

const MAX_COMMENT_LENGTH = 500;

/**
 * エピソードのコメント一覧を取得する
 * GET /api/episodes/[episode_id]/comments
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ episode_id: string }> }
): Promise<NextResponse> {
  try {
    const { episode_id } = await params;

    const comments = await prisma.comment.findMany({
      where: { episode_id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return serverErrorResponse('コメントの取得に失敗しました');
  }
}

/**
 * 新しいコメントを作成する
 * POST /api/episodes/[episode_id]/comments
 */
export async function POST(
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
    const body = await request.json() as CommentCreateRequest;
    const { content } = body;

    // バリデーション
    if (!content || typeof content !== 'string') {
      return badRequestResponse('コメント内容を入力してください');
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return badRequestResponse('コメント内容を入力してください');
    }

    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      return badRequestResponse(`コメントは${MAX_COMMENT_LENGTH}文字以内で入力してください`);
    }

    // エピソードが存在するか確認
    const episode = await prisma.episode.findUnique({
      where: { id: episode_id }
    });

    if (!episode) {
      return notFoundResponse('エピソードが見つかりません');
    }

    // コメントを作成
    const comment = await prisma.comment.create({
      data: {
        content: trimmedContent,
        user_id: user.id,
        episode_id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        }
      }
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return serverErrorResponse('コメントの作成に失敗しました');
  }
}
