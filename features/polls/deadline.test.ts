import { expect, test } from "vitest";

import { formatKst, isClosed, parseKstDateTime } from "@/features/polls";

test("마감 일시 입력은 한국 시간으로 해석한다", () => {
  expect(parseKstDateTime("2026-10-30T18:00")?.toISOString()).toBe(
    "2026-10-30T09:00:00.000Z"
  );
  expect(parseKstDateTime("")).toBeNull();
});

test("마감 일시가 지나면 투표는 마감된 상태다", () => {
  const deadline = new Date("2026-10-30T09:00:00.000Z");

  expect(isClosed(deadline, new Date("2026-10-30T08:59:59.000Z"))).toBe(false);
  expect(isClosed(deadline, new Date("2026-10-30T09:00:00.000Z"))).toBe(true);
});

test("일시는 한국 시간으로 표시한다", () => {
  expect(formatKst(new Date("2026-10-30T09:00:00.000Z"))).toBe("2026. 10. 30. (금) 18:00");
});
