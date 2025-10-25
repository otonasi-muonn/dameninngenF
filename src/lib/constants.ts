/**
 * エピソード関連の定数
 */
export const EPISODE_CONSTRAINTS = Object.freeze({
  MIN_LENGTH: 10,
  MAX_LENGTH: 500,
} as const);

/**
 * 診断履歴関連の定数
 */
export const DIAGNOSIS_HISTORY = Object.freeze({
  MAX_ITEMS: 50,
} as const);

/**
 * レート制限関連の定数
 */
export const RATE_LIMIT = Object.freeze({
  WINDOW_MS: 60 * 1000, // 1分
  MAX_REQUESTS: 10,
} as const);

/**
 * Gemini API関連の定数
 */
export const GEMINI_CONFIG = Object.freeze({
  MODEL: 'gemini-2.0-flash-exp',
} as const);
