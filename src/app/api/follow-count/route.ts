// app/api/follow-count/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const followingCount = await prisma.follow.count({
    where: { followerId: userId },
  });

  const followerCount = await prisma.follow.count({
    where: { followingId: userId },
  });

  return NextResponse.json({ followingCount, followerCount });
}
