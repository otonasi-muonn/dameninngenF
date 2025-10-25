// レート制限の設定
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分
const RATE_LIMIT_MAX_REQUESTS = 10;

// IPアドレスごとのリクエスト履歴
const requestHistory = new Map<string, number[]>();

export type RateLimitResult = {
  allowed: boolean;
  remainingRequests: number;
};

/**
 * レート制限をチェックする
 * @param ip クライアントのIPアドレス
 * @returns 許可状態と残りリクエスト数
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const userRequests = requestHistory.get(ip) || [];

  // 期間内のリクエストのみをフィルタリング
  const recentRequests = userRequests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remainingRequests: 0 };
  }

  recentRequests.push(now);
  requestHistory.set(ip, recentRequests);

  return { 
    allowed: true, 
    remainingRequests: RATE_LIMIT_MAX_REQUESTS - recentRequests.length 
  };
}

/**
 * IPアドレスを取得する
 * @param headers リクエストヘッダー
 * @returns IPアドレス
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
