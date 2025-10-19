export function formatUtcDateTime(input: string | number | Date): string {
  const iso = new Date(input).toISOString(); // 例: 2025-10-19T07:42:37.123Z
  return iso.slice(0, 19).replace('T', ' '); // 例: 2025-10-19 07:42:37
}

export function formatUtcDate(input: string | number | Date): string {
  return new Date(input).toISOString().slice(0, 10); // 例: 2025-10-19
}