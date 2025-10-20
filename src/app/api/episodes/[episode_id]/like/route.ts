import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// いいね（作成）
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ episode_id: string }> }
) {
  const { episode_id } = await context.params;

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.like.create({
      data: { user_id: user.id, episode_id },
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      // 一意制約違反 = すでにいいね済み -> 成功扱い
      return NextResponse.json({ ok: true });
    }
    console.error('Like POST error:', e);
    return NextResponse.json({ error: 'Failed to like' }, { status: 500 });
  }
}

// いいね解除（削除）
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ episode_id: string }> }
) {
  const { episode_id } = await context.params;

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.like.delete({
      where: {
        user_id_episode_id: { user_id: user.id, episode_id },
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      // 対象が存在しない = すでに解除済み -> 成功扱い
      return NextResponse.json({ ok: true });
    }
    console.error('Like DELETE error:', e);
    return NextResponse.json({ error: 'Failed to unlike' }, { status: 500 });
  }
}