import "server-only";

import { db } from "@/lib/supabase";

import type { Audience } from "./audience";
import type { PollKind, PollOption } from "./options";
import type { BallotEntry } from "./tally";
import type { NewItemPoll, NewPoll } from "./validate";

export type Poll = {
  id: string;
  kind: PollKind;
  title: string;
  description: string;
  deadline: Date;
  options: PollOption[];
  audience: Audience;
};

type PollRow = {
  id: string;
  kind: PollKind;
  title: string;
  description: string;
  deadline: string;
  audience: "all" | "group";
  poll_dates: { id: number; candidate_date: string }[];
  poll_items: { id: number; label: string; position: number }[];
  poll_targets: { member_id: string }[];
};

// ballot_choices also links polls to poll_dates and poll_items, so name the
// direct foreign keys.
const COLUMNS =
  "id, kind, title, description, deadline, audience, " +
  "poll_dates!poll_dates_poll_id_fkey (id, candidate_date), " +
  "poll_items!poll_items_poll_id_fkey (id, label, position), " +
  "poll_targets (member_id)";

function toPoll(row: PollRow): Poll {
  const options =
    row.kind === "item"
      ? [...row.poll_items]
          .sort((a, b) => a.position - b.position)
          .map((item) => ({ id: String(item.id), value: item.label }))
      : row.poll_dates
          .map((d) => ({ id: String(d.id), value: d.candidate_date }))
          .sort((a, b) => a.value.localeCompare(b.value));
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    deadline: new Date(row.deadline),
    options,
    audience:
      row.audience === "group"
        ? { kind: "group", memberIds: row.poll_targets.map((t) => t.member_id) }
        : { kind: "all" },
  };
}

function targetIds(audience: Audience): string[] | null {
  return audience.kind === "group" ? audience.memberIds : null;
}

export async function createDatePoll(poll: NewPoll): Promise<string> {
  const { data, error } = await db().rpc("create_date_poll", {
    p_title: poll.title,
    p_description: poll.description,
    p_deadline: poll.deadline.toISOString(),
    p_dates: poll.dates,
    p_member_ids: targetIds(poll.audience),
  });
  if (error) throw error;
  return data as string;
}

export async function createItemPoll(poll: NewItemPoll): Promise<string> {
  const { data, error } = await db().rpc("create_item_poll", {
    p_title: poll.title,
    p_description: poll.description,
    p_deadline: poll.deadline.toISOString(),
    p_items: poll.items,
    p_member_ids: targetIds(poll.audience),
  });
  if (error) throw error;
  return data as string;
}

export async function listPolls(): Promise<Poll[]> {
  const { data, error } = await db()
    .from("polls")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as PollRow[]).map(toPoll);
}

export async function getPoll(id: string): Promise<Poll | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("polls").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toPoll(data as unknown as PollRow) : null;
}

export async function listBallotEntries(pollIds: string[]): Promise<(BallotEntry & { pollId: string })[]> {
  if (pollIds.length === 0) return [];
  const { data, error } = await db()
    .from("ballot_choices")
    .select("poll_id, member_id, poll_date_id, poll_item_id")
    .in("poll_id", pollIds);
  if (error) throw error;
  type Row = { poll_id: string; member_id: string; poll_date_id: number | null; poll_item_id: number | null };
  return (data as Row[]).map((row) => ({
    pollId: row.poll_id,
    memberId: row.member_id,
    optionId: String(row.poll_item_id ?? row.poll_date_id),
  }));
}

const BALLOT_ERRORS: Record<string, string> = {
  poll_closed: "마감된 투표라 더 이상 제출할 수 없습니다.",
  poll_not_found: "투표를 찾을 수 없습니다.",
  member_not_found: "명단에 없는 사람은 투표할 수 없습니다.",
  not_target: "이 투표의 대상이 아닙니다.",
  no_dates: "하나 이상 골라 주세요.",
  invalid_date: "이 투표의 선택지가 아닙니다.",
};

export async function submitBallot(
  pollId: string,
  memberId: string,
  optionIds: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await db().rpc("submit_ballot", {
    p_poll_id: pollId,
    p_member_id: memberId,
    p_date_ids: optionIds.map(Number),
  });
  if (error) {
    const message = BALLOT_ERRORS[error.message];
    if (message) return { ok: false, error: message };
    throw error;
  }
  return { ok: true };
}
