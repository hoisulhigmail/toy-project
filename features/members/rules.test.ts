import { expect, test } from "vitest";

import { joinEmails, validateNewMember } from "@/features/members";

test("이름, 사번, 메일 주소가 모두 있어야 명단에 추가할 수 있다", () => {
  expect(validateNewMember({ name: " 홍길동 ", employeeNo: " 1234 ", email: "hong@lge.com" })).toEqual({
    ok: true,
    value: { name: "홍길동", employeeNo: "1234", email: "hong@lge.com" },
  });
  expect(validateNewMember({ name: "", employeeNo: "1234", email: "hong@lge.com" }).ok).toBe(false);
  expect(validateNewMember({ name: "홍길동", employeeNo: " ", email: "hong@lge.com" }).ok).toBe(false);
  expect(validateNewMember({ name: "홍길동", employeeNo: "1234", email: "" }).ok).toBe(false);
});

test("메일 주소 형식이 아니면 명단에 추가할 수 없다", () => {
  expect(validateNewMember({ name: "홍길동", employeeNo: "1234", email: "hong" }).ok).toBe(false);
});

test("미투표자 메일 주소는 세미콜론과 공백으로 이어 붙인다", () => {
  expect(joinEmails([{ email: "a@x.com" }, { email: "b@x.com" }])).toBe("a@x.com; b@x.com");
});
