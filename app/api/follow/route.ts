// app/api/follow/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';



export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { targetUserId } = await req.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
  return new Response(JSON.stringify({ message: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}


  const { error } = await supabase
    .from('Follow')
    .delete()
    .eq('followerId', user.id)       // ← ✅ 正しいカラム名
    .eq('followingId', targetUserId); // ← ✅ 正しいカラム名

  if (error) return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  return new Response(JSON.stringify({ message: 'OK' }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});
}