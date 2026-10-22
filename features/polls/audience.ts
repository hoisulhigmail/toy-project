export type Audience = { kind: "all" } | { kind: "group"; memberIds: string[] };

// Everyone on the roster for a whole-roster poll; for a small group, the
// chosen people who are still on the roster. Later roster additions never
// join a small group.
export function eligibleMemberIds(audience: Audience, rosterIds: string[]): string[] {
  if (audience.kind === "all") return rosterIds;
  const roster = new Set(rosterIds);
  return audience.memberIds.filter((id) => roster.has(id));
}
