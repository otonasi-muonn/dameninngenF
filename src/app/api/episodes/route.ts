import { NextResponse, NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// POST /api/episodes — create new episode (auth required)
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
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
      data: { content, user_id: session.user.id },
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
    const { data: { session } } = await supabase.auth.getSession();
    const me = session?.user?.id ?? null;

    type EpisodeRow = {
      id: string;
      content: string;
      created_at: string | Date;
      user_id: string;
      user?: { name?: string | null } | null;
      _count: { likes: number };
    };

    const [rows, total]: [EpisodeRow[], number] = await Promise.all([
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
      }) as Promise<EpisodeRow[]>,
      prisma.episode.count(),
    ]);

    let likedSet: Set<string> = new Set();
    if (me && rows.length > 0) {
      const likes = (await prisma.like.findMany({
        where: { user_id: me, episode_id: { in: rows.map((r: EpisodeRow) => r.id) } },
        select: { episode_id: true },
      })) as Array<{ episode_id: string }>;
      likedSet = new Set(likes.map((l: { episode_id: string }) => l.episode_id));
    }

    const items = rows.map((e: EpisodeRow) => ({
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