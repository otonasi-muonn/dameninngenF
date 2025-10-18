import { supabase } from '@/lib/supabase'

export default async function UserPage() {
  // いくつかの候補テーブル名を順に試して name を取得（デバッグ目的）
  const candidates = ['User'];
  let users: any[] = [];
  let error: any = null;
  let usedTable: string | null = null;
  const errorsByTable: Record<string, string> = {};

  for (const t of candidates) {
    try {
      const res = await supabase.from(t).select('id, name');
      console.log (res.error);
      if (!res.error) {
        users = res.data ?? [];
        usedTable = t;
        break;
      } else {
        errorsByTable[t] = res.error.message || String(res.error);
      }
    } catch (err: any) {
      errorsByTable[t] = err?.message || String(err);
    }
  }

  if (!usedTable && Object.keys(errorsByTable).length === 0) {
    error = new Error('テーブル候補のチェックで何らかの問題が発生しました');
  } else if (!usedTable) {
    error = { message: '候補テーブル全てで取得失敗', details: errorsByTable };
  }

  return (
    <>
      <div style={{ padding: 16 }}>
        <h1>ユーザーページ</h1>
        <p>ユーザー管理機能を実装します。</p>
      </div>

      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">ユーザー一覧</h1>

              {error ? (
                <div style={{ color: 'red' }}>
                  <p>データ取得エラー: {error.message || String(error)}</p>
                  {error.details && typeof error.details === 'object' && (
                    <div style={{ marginTop: 8 }}>
                      <p>各候補テーブルのエラー:</p>
                      <ul>
                        {Object.entries(error.details).map(([t, msg]) => (
                          <li key={t}><strong>{t}:</strong> {String(msg)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : users.length === 0 ? (
          <p>ユーザーが見つかりません。</p>
        ) : (
          <ul className="space-y-2">
            {users.map((u: any) => (
              <li key={u.id ?? u.name} className="border p-2 rounded">
                {u.name}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}