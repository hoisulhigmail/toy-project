import { formatKst, formatKstDay } from "./deadline";
import type { PollKind } from "./options";

// A closed poll's result as shown on the results screen. It never carries
// anyone's name: announcements and records only report counts.
export type PollResult = {
  kind: PollKind;
  title: string;
  description: string;
  audience: "all" | "group";
  deadline: Date;
  voterCount: number;
  eligibleCount: number;
  options: { label: string; count: number }[];
};

const WORDS = {
  date: { top: "가장 많이 가능한 날", section: "날짜별 결과", kind: "날짜 투표", column: "날짜" },
  item: { top: "가장 많이 선택된 항목", section: "항목별 결과", kind: "항목 투표", column: "항목" },
} as const;

function topLine(result: PollResult): string {
  const max = Math.max(0, ...result.options.map((o) => o.count));
  if (max === 0) return `${WORDS[result.kind].top}: 없음 (투표 없음)`;
  const top = result.options.filter((o) => o.count === max).map((o) => o.label);
  return `${WORDS[result.kind].top}: ${top.join(", ")} — ${top.length > 1 ? "각 " : ""}${max}표`;
}

function headcountLine(result: PollResult): string {
  const scope = result.audience === "group" ? "대상" : "전체";
  return `투표 인원: ${result.voterCount}명 / ${scope} ${result.eligibleCount}명`;
}

export function buildAnnouncement(result: PollResult): string {
  return [
    `제목: [결과 안내] ${result.title}`,
    "",
    `안녕하세요, ${result.title} 투표 결과를 안내드립니다.`,
    "",
    `■ ${topLine(result)}`,
    `■ ${headcountLine(result)}`,
    `■ 마감: ${formatKst(result.deadline)}`,
    "",
    `[${WORDS[result.kind].section}]`,
    ...result.options.map((o) => `- ${o.label}: ${o.count}표`),
    "",
    "감사합니다.",
  ].join("\n");
}

const escapeCell = (text: string) => text.replace(/\|/g, "\\|");

// Characters Windows and macOS refuse in file names become "-".
const fileSafe = (text: string) => text.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").trim();

export function buildResultRecord(result: PollResult): { fileName: string; markdown: string } {
  const words = WORDS[result.kind];
  const lines = [
    `# ${result.title}`,
    "",
    ...(result.description ? [result.description, ""] : []),
    `- 종류: ${words.kind}`,
    `- 대상: ${result.audience === "group" ? "소그룹" : "명단 전체"}`,
    `- 마감: ${formatKst(result.deadline)}`,
    `- ${headcountLine(result)}`,
    `- ${topLine(result)}`,
    "",
    `| ${words.column} | 득표 |`,
    "| --- | --- |",
    ...result.options.map((o) => `| ${escapeCell(o.label)} | ${o.count} |`),
    "",
  ];
  return {
    fileName: `${formatKstDay(result.deadline)}-${fileSafe(result.title)}.md`,
    markdown: lines.join("\n"),
  };
}
