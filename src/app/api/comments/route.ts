// app/api/comments/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const episodeId = typeof body.episodeId === 'string' ? body.episodeId : undefined;

    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    if (!episodeId) return NextResponse.json({ error: 'episodeId is required' }, { status: 400 });

    const comment = await prisma.comment.create({
      data: {
        content,
        episode_id: episodeId,
        user_id: user.id,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(comment);
  } catch (err) {
    // Log the full error on the server for debugging
    // In production you may want to sanitize this
    console.error('POST /api/comments error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
