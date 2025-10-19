import { NextResponse, NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// POST /api/episodes — create new episode (auth required)
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user){
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let content = '';
  try {
    const body = await request.json();
    content = typeof body?.content === 'string' ? body.content.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (content.length === 0 || content.length > 200) {
    return NextResponse.json({ error: 'content must be 1-200 chars' }, { status: 400 });
  }

  try {
    const created = await prisma.episode.create({
      data: { content, user_id: user.id },
      select: { id: true, content: true, created_at: true, user_id: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create episode' }, { status: 500 });
  }
}

// GET /api/episodes — list with pagination, likes count, and likedByMe flag
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    const limitRaw = Number(searchParams.get('limit') ?? '20') || 20;
    const limit = Math.min(Math.max(1, limitRaw), 100);
    const skip = (page - 1) * limit;

    // Optional user for likedByMe
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    const me = user?.id ?? null;

    const [rows, total] = await Promise.all([
      prisma.episode.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          content: true,
          created_at: true,
          user_id: true,
          user: { select: { name: true } },
          _count: { select: { likes: true } },
        },
      }),
      prisma.episode.count(),
    ]);

    let likedSet: Set<string> = new Set();
    if (me && rows.length > 0) {
      const likes = await prisma.like.findMany({
        where: { user_id: me, episode_id: { in: rows.map((r) => r.id) } },
        select: { episode_id: true },
      });
      likedSet = new Set(likes.map((l) => l.episode_id));
    }

    const items = rows.map((e) => ({
      id: e.id,
      content: e.content,
      created_at: e.created_at,
      user_id: e.user_id,
      user_name: e.user?.name ?? null,
      likes: e._count.likes,
      likedByMe: me ? likedSet.has(e.id) : false,
    }));

    return NextResponse.json({ items, meta: { total, page, limit } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 });
  }
}