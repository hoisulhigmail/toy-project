import { expect, test } from "vitest";

import { validateNewItemPoll, validateNewPoll } from "@/features/polls";

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
      audience: { kind: "all" },
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

test("소그룹을 고르면 고른 사람이 투표 대상이 된다", () => {
  const result = validateNewPoll(
    {
      title: "t",
      description: "",
      dates: ["2026-11-06"],
      deadline: "2026-10-30T18:00",
      audience: { kind: "group", memberIds: ["m1", "m2", "m1"] },
    },
    now
  );

  expect(result.ok && result.value.audience).toEqual({ kind: "group", memberIds: ["m1", "m2"] });
});

test("소그룹인데 아무도 고르지 않으면 날짜 투표를 만들 수 없다", () => {
  const result = validateNewPoll(
    {
      title: "t",
      description: "",
      dates: ["2026-11-06"],
      deadline: "2026-10-30T18:00",
      audience: { kind: "group", memberIds: [] },
    },
    now
  );

  expect(result).toEqual({ ok: false, error: "소그룹 대상을 한 명 이상 골라 주세요." });
});

test("후보 항목은 공백을 지우고 같은 글은 한 번만 넣으며 넣은 순서를 지킨다", () => {
  const result = validateNewItemPoll(
    { title: "활동", description: "", items: [" 볼링 ", "방탈출", "볼링", ""], deadline: "2026-10-30T18:00" },
    now
  );

  expect(result.ok && result.value.items).toEqual(["볼링", "방탈출"]);
  expect(result.ok && result.value.audience).toEqual({ kind: "all" });
});

test("후보 항목이 2개보다 적으면 항목 투표를 만들 수 없다", () => {
  const base = { title: "활동", description: "", deadline: "2026-10-30T18:00" };

  expect(validateNewItemPoll({ ...base, items: ["볼링"] }, now)).toEqual({
    ok: false,
    error: "후보 항목을 두 개 이상 넣어 주세요.",
  });
  expect(validateNewItemPoll({ ...base, items: ["볼링", " 볼링", ""] }, now).ok).toBe(false);
});

test("항목 투표도 제목, 마감, 소그룹 규칙은 날짜 투표와 같다", () => {
  const base = { title: "활동", description: "", items: ["a", "b"], deadline: "2026-10-30T18:00" };

  expect(validateNewItemPoll({ ...base, title: " " }, now).ok).toBe(false);
  expect(validateNewItemPoll({ ...base, deadline: "2026-10-21T18:00" }, now).ok).toBe(false);
  expect(validateNewItemPoll({ ...base, audience: { kind: "group", memberIds: [] } }, now).ok).toBe(false);
});
