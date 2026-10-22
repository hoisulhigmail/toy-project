export type Audience = { kind: "all" } | { kind: "group"; memberIds: string[] };

// Everyone on the roster for a whole-roster poll, except people kept out of
// whole-roster polls (the test account); for a small group, the chosen
// people who are still on the roster. Later roster additions never join a
// small group.
export function eligibleMemberIds(
  audience: Audience,
  rosterIds: string[],
  excludedFromAll: string[] = []
): string[] {
  if (audience.kind === "all") {
    const excluded = new Set(excludedFromAll);
    return rosterIds.filter((id) => !excluded.has(id));
  }
  const roster = new Set(rosterIds);
  return audience.memberIds.filter((id) => roster.has(id));
}
