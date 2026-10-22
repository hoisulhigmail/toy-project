import { expect, test } from "vitest";

import { tallyPoll } from "@/features/polls";

const dates = [{ id: "d1" }, { id: "d2" }, { id: "d3" }];

test("날짜 투표 집계는 날짜별 득표 수와 투표 인원을 센다", () => {
  const result = tallyPoll({
    dates,
    ballots: [
      { memberId: "m1", dateId: "d1" },
      { memberId: "m1", dateId: "d2" },
      { memberId: "m2", dateId: "d2" },
    ],
    eligibleMemberIds: ["m1", "m2", "m3"],
  });

  expect(result.counts).toEqual({ d1: 1, d2: 2, d3: 0 });
  expect(result.voterCount).toBe(2);
  expect(result.topDateIds).toEqual(["d2"]);
});

test("득표가 가장 많은 날이 동점이면 모두 강조 대상이다", () => {
  const result = tallyPoll({
    dates,
    ballots: [
      { memberId: "m1", dateId: "d1" },
      { memberId: "m2", dateId: "d3" },
    ],
    eligibleMemberIds: ["m1", "m2"],
  });

  expect(result.topDateIds).toEqual(["d1", "d3"]);
});

test("아직 표가 없으면 강조 대상이 없다", () => {
  const result = tallyPoll({ dates, ballots: [], eligibleMemberIds: ["m1"] });

  expect(result.topDateIds).toEqual([]);
  expect(result.voterCount).toBe(0);
});

test("인원 명단에서 삭제된 사람의 표는 득표와 투표 인원에서 빠진다", () => {
  const result = tallyPoll({
    dates,
    ballots: [
      { memberId: "removed", dateId: "d1" },
      { memberId: "m1", dateId: "d2" },
    ],
    eligibleMemberIds: ["m1"],
  });

  expect(result.counts).toEqual({ d1: 0, d2: 1, d3: 0 });
  expect(result.voterIds).toEqual(["m1"]);
});
