import type { Audience } from "./audience";
import { isClosed, parseKstDateTime } from "./deadline";

type CommonInput = {
  title: string;
  description: string;
  deadline: string;
  audience?: Audience;
};

type Common = {
  title: string;
  description: string;
  deadline: Date;
  audience: Audience;
};

export type NewPollInput = CommonInput & { dates: string[] };
export type NewPoll = Common & { dates: string[] };
export type NewItemPollInput = CommonInput & { items: string[] };
export type NewItemPoll = Common & { items: string[] };

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Title, deadline and audience rules are shared by every poll kind;
// `optionsError` reports the kind-specific problem with its choices.
function validateCommon(input: CommonInput, now: Date, optionsError: string | null): Result<Common> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "제목을 입력해 주세요." };
  if (optionsError) return { ok: false, error: optionsError };

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

  return { ok: true, value: { title, description: input.description.trim(), deadline, audience } };
}

export function validateNewPoll(input: NewPollInput, now: Date = new Date()): Result<NewPoll> {
  const dates = [...new Set(input.dates.map((d) => d.trim()).filter((d) => DATE_PATTERN.test(d)))].sort();
  const common = validateCommon(input, now, dates.length === 0 ? "후보 날짜를 하나 이상 넣어 주세요." : null);
  return common.ok ? { ok: true, value: { ...common.value, dates } } : common;
}

// Items keep the order the organizer typed them in.
export function validateNewItemPoll(input: NewItemPollInput, now: Date = new Date()): Result<NewItemPoll> {
  const items = [...new Set(input.items.map((item) => item.trim()).filter(Boolean))];
  const common = validateCommon(input, now, items.length < 2 ? "후보 항목을 두 개 이상 넣어 주세요." : null);
  return common.ok ? { ok: true, value: { ...common.value, items } } : common;
}
