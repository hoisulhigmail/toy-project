import "server-only";

import { db } from "@/lib/supabase";

import type { Audience } from "./audience";
import type { BallotEntry } from "./tally";
import type { NewPoll } from "./validate";

export type CandidateDate = { id: string; date: string };

export type Poll = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  dates: CandidateDate[];
  audience: Audience;
};

type PollRow = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  audience: "all" | "group";
  poll_dates: { id: number; candidate_date: string }[];
  poll_targets: { member_id: string }[];
};

// ballot_choices also links polls to poll_dates, so name the direct FK.
const COLUMNS =
  "id, title, description, deadline, audience, poll_dates!poll_dates_poll_id_fkey (id, candidate_date), poll_targets (member_id)";

function toPoll(row: PollRow): Poll {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    deadline: new Date(row.deadline),
    dates: row.poll_dates
      .map((d) => ({ id: String(d.id), date: d.candidate_date }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    audience:
      row.audience === "group"
        ? { kind: "group", memberIds: row.poll_targets.map((t) => t.member_id) }
        : { kind: "all" },
  };
}

export async function createDatePoll(poll: NewPoll): Promise<string> {
  const { data, error } = await db().rpc("create_date_poll", {
    p_title: poll.title,
    p_description: poll.description,
    p_deadline: poll.deadline.toISOString(),
    p_dates: poll.dates,
    p_member_ids: poll.audience.kind === "group" ? poll.audience.memberIds : null,
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
  return (data as PollRow[]).map(toPoll);
}

export async function getPoll(id: string): Promise<Poll | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("polls").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toPoll(data as PollRow) : null;
}

export async function listBallotEntries(pollIds: string[]): Promise<(BallotEntry & { pollId: string })[]> {
  if (pollIds.length === 0) return [];
  const { data, error } = await db()
    .from("ballot_choices")
    .select("poll_id, member_id, poll_date_id")
    .in("poll_id", pollIds);
  if (error) throw error;
  return (data as { poll_id: string; member_id: string; poll_date_id: number }[]).map((row) => ({
    pollId: row.poll_id,
    memberId: row.member_id,
    dateId: String(row.poll_date_id),
  }));
}

const BALLOT_ERRORS: Record<string, string> = {
  poll_closed: "마감된 투표라 더 이상 제출할 수 없습니다.",
  poll_not_found: "투표를 찾을 수 없습니다.",
  member_not_found: "명단에 없는 사람은 투표할 수 없습니다.",
  not_target: "이 투표의 대상이 아닙니다.",
  no_dates: "가능한 날을 하나 이상 골라 주세요.",
  invalid_date: "이 투표의 후보 날짜가 아닙니다.",
};

export async function submitBallot(
  pollId: string,
  memberId: string,
  dateIds: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await db().rpc("submit_ballot", {
    p_poll_id: pollId,
    p_member_id: memberId,
    p_date_ids: dateIds.map(Number),
  });
  if (error) {
    const message = BALLOT_ERRORS[error.message];
    if (message) return { ok: false, error: message };
    throw error;
  }
  return { ok: true };
}
