export type NewMember = { name: string; employeeNo: string; email: string };

type Validation =
  | { ok: true; value: NewMember }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateNewMember(input: NewMember): Validation {
  const value = {
    name: input.name.trim(),
    employeeNo: input.employeeNo.trim(),
    email: input.email.trim(),
  };
  if (!value.name || !value.employeeNo || !value.email) {
    return { ok: false, error: "이름, 사번, 메일 주소를 모두 입력해 주세요." };
  }
  if (!EMAIL_PATTERN.test(value.email)) {
    return { ok: false, error: "메일 주소 형식이 올바르지 않습니다." };
  }
  return { ok: true, value };
}

// Outlook's recipient field accepts "; " separated addresses as-is.
export function joinEmails(members: { email: string }[]): string {
  return members.map((member) => member.email).join("; ");
}

// The 검증총무 account is for trying features; it is never part of a
// whole-roster poll and joins polls only when picked for a small group.
const TEST_EMPLOYEE_NOS = new Set(["T9001"]);

export function isTestMember(member: { employeeNo: string }): boolean {
  return TEST_EMPLOYEE_NOS.has(member.employeeNo);
}
