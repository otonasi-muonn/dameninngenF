import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import FollowButton from '@/components/ui/FollowButton';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

type UserItem = { id: string; name?: string | null };



export default async function UserPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentUserId = session?.user.id;

  // N+1回避
  const rows = await prisma.user.findMany({
    where: { id: { not: currentUserId ?? undefined } },
    select: {
      id: true,
      name: true,
      avatar_url: true,
      // 自分がフォローしているかを絞り込み取得（有無だけ見たいので take:1）
      followedBy: currentUserId
        ? {
            where: { followerId: currentUserId },
            select: { followerId: true },
            take: 1,
          }
        : false,
    },
    orderBy: { name: 'asc' },
  });

  type Row = {
    id: string;
    name: string | null;
    followedBy?: Array<{ followerId: string }>;
  };

  const usersWithFollowStatus: Array<{
  id: string;
  name?: string | null;
  avatar_url?: string | null;
  isFollowing: boolean;
}> = rows.map((u: Row & { avatar_url?: string | null }) => ({
  id: u.id,
  name: u.name ?? null,
  avatar_url: u.avatar_url ?? null,
  isFollowing: Array.isArray(u.followedBy) ? u.followedBy.length > 0 : false,
}));


  return (
  <div>
    <h2 style={{ fontFamily: 'sans-serif', color: '#333', fontSize: '28px', marginBottom: '20px' }}>
      👥 ユーザー一覧
    </h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {usersWithFollowStatus.map((u) => (
        <div
          key={u.id}
          style={{
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#f9f9f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {u.avatar_url ? (
              <img
                src={u.avatar_url}
                alt="avatar"
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                👤
              </div>
            )}
             <Link href={`/profile/${u.id}`} style={{ textDecoration: 'none', color: '#333' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                  {u.name || '名無しさん'}
                </p>
              </Link>


          </div>
          {currentUserId && (
            <FollowButton
              userId={u.id}
              isInitiallyFollowing={u.isFollowing}
            />
          )}
        </div>
      ))}
    </div>
  </div>
)};
