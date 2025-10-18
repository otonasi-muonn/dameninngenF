// /app/api/follow/route.ts
import { prisma } from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { followingId } = await req.json();
  const followerId = session.user.id;

  if (followerId === followingId) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
  }

  try {
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
    return NextResponse.json(follow);
  } catch (error) {
    console.error('Error creating follow:', error);
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { followingId } = await req.json();
  const followerId = session.user.id;

  try {
    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting follow:', error);
    return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 });
  }
}
