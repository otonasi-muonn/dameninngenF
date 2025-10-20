import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// GET /api/user — get current logged in user info
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true }
    });

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
