export function formatUtcDateTime(input: string | number | Date): string {
  try {
    return new Date(input).toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '-').replace(/^(.+)\s/, (m) => m.replace(/-/g, '-'));
  } catch (e) {
    // 何らかの理由で変換に失敗した場合は ISO のフォールバック
    const iso = new Date(input).toISOString();
    return iso.slice(0, 19).replace('T', ' ');
  }
}

export function formatUtcDate(input: string | number | Date): string {
  try {
    return new Date(input).toLocaleDateString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '-');
  } catch (e) {
    return new Date(input).toISOString().slice(0, 10);
  }
}