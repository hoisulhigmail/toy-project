const KST_OFFSET = "+09:00";
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// Deadlines are entered and shown in Korea time regardless of where the
// server or browser runs.
export function parseKstDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${KST_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isClosed(deadline: Date, now: Date = new Date()): boolean {
  return now.getTime() >= deadline.getTime();
}

function kstParts(date: Date) {
  const shifted = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: WEEKDAYS[shifted.getUTCDay()],
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatKst(date: Date): string {
  const p = kstParts(date);
  return `${p.year}. ${p.month}. ${p.day}. (${p.weekday}) ${pad(p.hour)}:${pad(p.minute)}`;
}

// Candidate dates are calendar days ("YYYY-MM-DD") with no time zone.
export function formatCandidateDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${month}월 ${day}일 (${weekday})`;
}
