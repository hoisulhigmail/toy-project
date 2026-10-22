export type BallotEntry = { memberId: string; dateId: string };

export type PollTally = {
  counts: Record<string, number>;
  voterCount: number;
  voterIds: string[];
  topDateIds: string[];
};

// Ballots from people no longer on the roster are ignored, so removing a
// member drops their votes from both the counts and the progress.
export function tallyPoll({
  dates,
  ballots,
  eligibleMemberIds,
}: {
  dates: { id: string }[];
  ballots: BallotEntry[];
  eligibleMemberIds: string[];
}): PollTally {
  const eligible = new Set(eligibleMemberIds);
  const counts: Record<string, number> = Object.fromEntries(
    dates.map((date) => [date.id, 0])
  );
  const voters = new Set<string>();

  for (const ballot of ballots) {
    if (!eligible.has(ballot.memberId) || !(ballot.dateId in counts)) continue;
    counts[ballot.dateId] += 1;
    voters.add(ballot.memberId);
  }

  const max = Math.max(0, ...Object.values(counts));
  const topDateIds =
    max === 0 ? [] : dates.filter((date) => counts[date.id] === max).map((date) => date.id);

  return { counts, voterCount: voters.size, voterIds: [...voters], topDateIds };
}
