// An option is a candidate date or a candidate item; tallying is the same.
export type BallotEntry = { memberId: string; optionId: string };

export type PollTally = {
  counts: Record<string, number>;
  voterCount: number;
  voterIds: string[];
  topOptionIds: string[];
};

// Ballots from people outside the audience are ignored, so removing a
// member drops their votes from both the counts and the progress.
export function tallyPoll({
  options,
  ballots,
  eligibleMemberIds,
}: {
  options: { id: string }[];
  ballots: BallotEntry[];
  eligibleMemberIds: string[];
}): PollTally {
  const eligible = new Set(eligibleMemberIds);
  const counts: Record<string, number> = Object.fromEntries(
    options.map((option) => [option.id, 0])
  );
  const voters = new Set<string>();

  for (const ballot of ballots) {
    if (!eligible.has(ballot.memberId) || !(ballot.optionId in counts)) continue;
    counts[ballot.optionId] += 1;
    voters.add(ballot.memberId);
  }

  const max = Math.max(0, ...Object.values(counts));
  const topOptionIds =
    max === 0 ? [] : options.filter((option) => counts[option.id] === max).map((option) => option.id);

  return { counts, voterCount: voters.size, voterIds: [...voters], topOptionIds };
}
