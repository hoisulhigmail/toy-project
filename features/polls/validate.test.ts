import { expect, test } from "vitest";

import { validateNewPoll } from "@/features/polls";

const now = new Date("2026-10-22T00:00:00.000Z");

test("제목, 후보 날짜, 미래의 마감 일시가 있으면 날짜 투표를 만들 수 있다", () => {
  expect(
    validateNewPoll(
      {
        title: " 야유회 날짜 ",
        description: "가능한 날을 모두 골라 주세요.",
        dates: ["2026-11-07", "2026-11-06", "2026-11-07", ""],
        deadline: "2026-10-30T18:00",
      },
      now
    )
  ).toEqual({
    ok: true,
    value: {
      title: "야유회 날짜",
      description: "가능한 날을 모두 골라 주세요.",
      dates: ["2026-11-06", "2026-11-07"],
      deadline: new Date("2026-10-30T09:00:00.000Z"),
    },
  });
});

test("제목이나 후보 날짜가 없으면 날짜 투표를 만들 수 없다", () => {
  const base = { title: "t", description: "", dates: ["2026-11-06"], deadline: "2026-10-30T18:00" };

  expect(validateNewPoll({ ...base, title: " " }, now).ok).toBe(false);
  expect(validateNewPoll({ ...base, dates: [""] }, now).ok).toBe(false);
});

test("마감 일시가 비었거나 이미 지났으면 날짜 투표를 만들 수 없다", () => {
  const base = { title: "t", description: "", dates: ["2026-11-06"], deadline: "" };

  expect(validateNewPoll(base, now).ok).toBe(false);
  expect(validateNewPoll({ ...base, deadline: "2026-10-21T18:00" }, now).ok).toBe(false);
});
