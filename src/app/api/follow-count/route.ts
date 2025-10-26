import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { unauthorizedResponse } from '@/lib/apiResponse';

export async function POST(): Promise<NextResponse> {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return unauthorizedResponse();
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
