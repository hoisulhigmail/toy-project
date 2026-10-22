import type { Audience } from "./audience";
import { isClosed, parseKstDateTime } from "./deadline";

export type NewPollInput = {
  title: string;
  description: string;
  dates: string[];
  deadline: string;
  audience?: Audience;
};

export type NewPoll = {
  title: string;
  description: string;
  dates: string[];
  deadline: Date;
  audience: Audience;
};

type Validation = { ok: true; value: NewPoll } | { ok: false; error: string };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateNewPoll(input: NewPollInput, now: Date = new Date()): Validation {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "제목을 입력해 주세요." };

  const dates = [...new Set(input.dates.map((d) => d.trim()).filter((d) => DATE_PATTERN.test(d)))].sort();
  if (dates.length === 0) return { ok: false, error: "후보 날짜를 하나 이상 넣어 주세요." };

  const deadline = parseKstDateTime(input.deadline);
  if (!deadline) return { ok: false, error: "마감 일시를 입력해 주세요." };
  if (isClosed(deadline, now)) return { ok: false, error: "마감 일시는 지금보다 뒤여야 합니다." };

  const audience: Audience =
    input.audience?.kind === "group"
      ? { kind: "group", memberIds: [...new Set(input.audience.memberIds)] }
      : { kind: "all" };
  if (audience.kind === "group" && audience.memberIds.length === 0) {
    return { ok: false, error: "소그룹 대상을 한 명 이상 골라 주세요." };
  }

  return { ok: true, value: { title, description: input.description.trim(), dates, deadline, audience } };
}
