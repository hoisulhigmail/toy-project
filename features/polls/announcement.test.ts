import { expect, test } from "vitest";

import { buildAnnouncement, buildResultRecord } from "@/features/polls";

const deadline = new Date("2026-10-30T09:00:00.000Z");

const dateResult = {
  kind: "date" as const,
  title: "가을 야유회 날짜",
  description: "가능한 날을 모두 골라 주세요.",
  audience: "all" as const,
  deadline,
  voterCount: 32,
  eligibleCount: 38,
  options: [
    { label: "11월 6일 (금)", count: 12 },
    { label: "11월 7일 (토)", count: 18 },
    { label: "11월 13일 (금)", count: 9 },
  ],
};

test("날짜 투표의 공지 메일 초안은 확정한 예시와 같은 글이다", () => {
  expect(buildAnnouncement(dateResult)).toBe(
    [
      "제목: [결과 안내] 가을 야유회 날짜",
      "",
      "안녕하세요, 가을 야유회 날짜 투표 결과를 안내드립니다.",
      "",
      "■ 가장 많이 가능한 날: 11월 7일 (토) — 18표",
      "■ 투표 인원: 32명 / 전체 38명",
      "■ 마감: 2026. 10. 30. (금) 18:00",
      "",
      "[날짜별 결과]",
      "- 11월 6일 (금): 12표",
      "- 11월 7일 (토): 18표",
      "- 11월 13일 (금): 9표",
      "",
      "감사합니다.",
    ].join("\n")
  );
});

test("항목 투표 초안은 항목 문구를 쓰고 동점이면 모두 각 N표로 적는다", () => {
  const text = buildAnnouncement({
    ...dateResult,
    kind: "item",
    title: "야유회 활동",
    options: [
      { label: "볼링", count: 5 },
      { label: "바비큐", count: 5 },
      { label: "방탈출", count: 2 },
    ],
  });

  expect(text).toContain("■ 가장 많이 선택된 항목: 볼링, 바비큐 — 각 5표");
  expect(text).toContain("[항목별 결과]\n- 볼링: 5표\n- 바비큐: 5표\n- 방탈출: 2표");
});

test("표가 없으면 최다 줄에 없음을 적고, 소그룹은 대상 인원으로 적는다", () => {
  const text = buildAnnouncement({
    ...dateResult,
    audience: "group",
    voterCount: 0,
    eligibleCount: 3,
    options: dateResult.options.map((o) => ({ ...o, count: 0 })),
  });

  expect(text).toContain("■ 가장 많이 가능한 날: 없음 (투표 없음)");
  expect(text).toContain("■ 투표 인원: 0명 / 대상 3명");
});

test("결과 기록은 이름 없이 결과를 Markdown으로 담고 마감일과 제목으로 파일 이름을 짓는다", () => {
  const record = buildResultRecord({ ...dateResult, title: "가을/야유회: 날짜?" });

  expect(record.fileName).toBe("2026-10-30-가을-야유회- 날짜-.md");
  expect(record.markdown).toBe(
    [
      "# 가을/야유회: 날짜?",
      "",
      "가능한 날을 모두 골라 주세요.",
      "",
      "- 종류: 날짜 투표",
      "- 대상: 명단 전체",
      "- 마감: 2026. 10. 30. (금) 18:00",
      "- 투표 인원: 32명 / 전체 38명",
      "- 가장 많이 가능한 날: 11월 7일 (토) — 18표",
      "",
      "| 날짜 | 득표 |",
      "| --- | --- |",
      "| 11월 6일 (금) | 12 |",
      "| 11월 7일 (토) | 18 |",
      "| 11월 13일 (금) | 9 |",
      "",
    ].join("\n")
  );
});

test("결과 기록은 설명이 없으면 설명 줄을 빼고, 표 안의 세로선을 이스케이프한다", () => {
  const record = buildResultRecord({
    ...dateResult,
    kind: "item",
    description: "",
    audience: "group",
    options: [
      { label: "A|B", count: 1 },
      { label: "C", count: 0 },
    ],
  });

  expect(record.markdown.startsWith("# 가을 야유회 날짜\n\n- 종류: 항목 투표\n- 대상: 소그룹\n")).toBe(true);
  expect(record.markdown).toContain("| 항목 | 득표 |");
  expect(record.markdown).toContain("| A\\|B | 1 |");
});
