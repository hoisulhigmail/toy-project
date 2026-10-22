import { formatCandidateDate } from "./deadline";

export type PollKind = "date" | "item";

// value is a "YYYY-MM-DD" day for date polls and the item text for item polls.
export type PollOption = { id: string; value: string };

export function optionLabel(kind: PollKind, value: string): string {
  return kind === "date" ? formatCandidateDate(value) : value;
}
