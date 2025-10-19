import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// `params` を受け取ることで、URLの [episode_id] を取得できる
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ episode_id: string }> }
) {
  const { episode_id } = await params;
  const supabase = createRouteHandlerClient({ cookies });

  // ログインユーザーの情報を取得
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user_id = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const del = await tx.like.deleteMany({ where: { user_id, episode_id } })
      if (del.count > 0) return { message: 'Unliked' as const }
      await tx.like.create({ data: { user_id, episode_id } })
      return { message: 'Liked' as const }
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}