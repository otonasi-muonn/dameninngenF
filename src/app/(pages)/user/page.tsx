import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import FollowButton from '@/components/ui/FollowButton';
import { prisma } from '@/lib/prisma';

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

  const usersWithFollowStatus: Array<{ id: string; name?: string | null; isFollowing: boolean }> = rows.map(
    (u: Row) => ({
      id: u.id,
      name: u.name ?? null,
      // 未ログイン時は false、ログイン時は関連が1件以上あれば true
      isFollowing: Array.isArray(u.followedBy) ? u.followedBy.length > 0 : false,
    })
  );

  return (
    <div>
      <h2 style={{ fontFamily: 'sans-serif', color: '#333',fontSize: '28px', marginBottom: '20px'}}>👥 ユーザー一覧</h2>
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
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
              {u.name || '名無しさん'}
            </p>
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
  );
}

