import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import FollowButton from '../../_components/ui/FollowButton';

type UserItem = { id: string; name?: string | null };



export default async function UserPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentUserId = session?.user.id;

  // supabase の data は undefined になる可能性があるのでデフォルトを空配列にする
  const { data: users } = await supabase
    .from('User')
    .select('id, name')
    .neq('id', currentUserId);

  const { data: followings } = await supabase
    .from('Follow')
    .select('followingId')
    .eq('followerId', currentUserId);

  const usersArr = users ?? [];
  const followingsArr = followings ?? [];

  const followingSet = new Set(followingsArr.map((f) => f.followingId));

  const usersWithFollowStatus: Array<{ id: string; name?: string | null; isFollowing: boolean }> =
    usersArr.map((u: UserItem) => ({
      ...u,
      isFollowing: followingSet.has(u.id),
    }));

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

