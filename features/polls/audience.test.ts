import { expect, test } from "vitest";

import { eligibleMemberIds } from "@/features/polls";

const roster = ["m1", "m2", "m3", "m4"];

test("명단 전체 투표의 대상은 현재 인원 명단 전체다", () => {
  expect(eligibleMemberIds({ kind: "all" }, roster)).toEqual(roster);
});

test("소그룹 투표의 대상은 고른 사람 중 아직 명단에 있는 사람이다", () => {
  expect(eligibleMemberIds({ kind: "group", memberIds: ["m2", "m4", "removed"] }, roster)).toEqual([
    "m2",
    "m4",
  ]);
});

test("소그룹 투표를 만든 뒤 명단에 추가된 사람은 대상이 아니다", () => {
  expect(eligibleMemberIds({ kind: "group", memberIds: ["m1"] }, [...roster, "new"])).toEqual(["m1"]);
});
