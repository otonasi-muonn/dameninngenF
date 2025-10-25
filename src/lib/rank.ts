// ランク定義: Z(最低) → A(最高)
const RANKS = ['Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S', 'R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'] as const;

type RankInfo = {
  rank: string;
  rankIndex: number;
  currentLikes: number;
  nextRankLikes: number | null;
  progress: number;
  color: string;
  name: string;
  icon: string;
};

/**
 * ランク名とアイコンを取得
 * @param rank ランク文字列
 * @returns ランク名とアイコン
 */
function getRankNameAndIcon(rank: string): { name: string; icon: string } {
  const rankIndex = RANKS.indexOf(rank as typeof RANKS[number]);
  
  if (rankIndex >= 23) return { name: 'レジェンド', icon: '👑' }; // A, B, C
  if (rankIndex >= 20) return { name: 'マスター', icon: '⭐' }; // D, E, F
  if (rankIndex >= 15) return { name: 'エキスパート', icon: '🏆' }; // G-K
  if (rankIndex >= 10) return { name: 'プロ', icon: '💎' }; // L-P
  if (rankIndex >= 5) return { name: '中級者', icon: '🌟' }; // Q-U
  return { name: '初心者', icon: '🔰' }; // V-Z
}

/**
 * いいね数からランクを計算
 * @param totalLikes ユーザーの総いいね数
 * @returns ランク情報
 */
export function calculateRank(totalLikes: number): RankInfo {
  // 負数のガード
  const safeLikes = Math.max(0, totalLikes);
  
  // 1いいねごとに1ランクアップ (0いいね = Z, 1いいね = Y, ...)
  const rankIndex = Math.min(safeLikes, RANKS.length - 1);
  const rank = RANKS[rankIndex];
  
  // 最高ランク到達後の追加いいね数
  const currentLikes = safeLikes > RANKS.length - 1 ? safeLikes - (RANKS.length - 1) : 0;
  
  // 次のランクに必要ないいね数（最高ランクの場合はnull）
  const nextRankLikes = rankIndex < RANKS.length - 1 ? 1 : null;
  
  // 進捗率（最高ランクの場合は100%）
  const progress = rankIndex < RANKS.length - 1 ? 0 : 100;

  // 色、名前、アイコンを取得
  const color = getRankColor(rank);
  const { name, icon } = getRankNameAndIcon(rank);

  return {
    rank,
    rankIndex,
    currentLikes,
    nextRankLikes,
    progress,
    color,
    name,
    icon,
  };
}

/**
 * ランクに対応する色を取得
 * @param rank ランク文字列
 * @returns カラーコード
 */
export function getRankColor(rank: string): string {
  const rankIndex = RANKS.indexOf(rank as typeof RANKS[number]);
  
  // ランクが存在しない場合のデフォルト
  if (rankIndex === -1) return '#9E9E9E';

  // ランクに応じた色分け
  if (rankIndex >= 23) return '#FFD700'; // A, B, C: ゴールド
  if (rankIndex >= 20) return '#C0C0C0'; // D, E, F: シルバー
  if (rankIndex >= 15) return '#CD7F32'; // G-K: ブロンズ
  if (rankIndex >= 10) return '#4A90E2'; // L-P: ブルー
  if (rankIndex >= 5) return '#50C878';  // Q-U: グリーン
  return '#9E9E9E';                     // V-Z: グレー
}
