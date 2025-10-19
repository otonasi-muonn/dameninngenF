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

// import { NextResponse } from 'next/server';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
// import { prisma } from '@/lib/prisma';

// // ユーザーをフォローする
// export async function POST(req: Request) {
//   const supabase = createRouteHandlerClient({ cookies });
//   const { data: { session } } = await supabase.auth.getSession();
//   if (!session) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { followingId } = await req.json();
//   const followerId = session.user.id;

//   if (followerId === followingId) {
//     return NextResponse.json({ error: '自分自身をフォローすることはできません' }, { status: 400 });
//   }

//   try {
//     await prisma.follow.create({
//       data: {
//         followerId: followerId,
//         followingId: followingId,
//       },
//     });
//     return NextResponse.json({ message: 'フォローしました' }, { status: 201 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'フォローに失敗しました' }, { status: 500 });
//   }
// }

// // ユーザーのフォローを解除する
// export async function DELETE(req: Request) {
//   const supabase = createRouteHandlerClient({ cookies });
//   const { data: { session } } = await supabase.auth.getSession();
//   if (!session) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { followingId } = await req.json();
//   const followerId = session.user.id;

//   try {
//     await prisma.follow.delete({
//       where: {
//         followerId_followingId: {
//           followerId: followerId,
//           followingId: followingId,
//         },
//       },
//     });
//     return NextResponse.json({ message: 'フォローを解除しました' });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'フォロー解除に失敗しました' }, { status: 500 });
//   }
// }