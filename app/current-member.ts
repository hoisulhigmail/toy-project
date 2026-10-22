import "server-only";

import { redirect } from "next/navigation";

import { getMember, type Member } from "@/features/members/server";
import { getSessionMemberId } from "@/features/session";

// A session only counts while its person is still on the roster, so removing
// someone locks them out even if their browser still holds the cookie.
export async function getCurrentMember(): Promise<Member | null> {
  const memberId = await getSessionMemberId();
  return memberId ? getMember(memberId) : null;
}

export async function requireOrganizer(): Promise<Member> {
  const member = await getCurrentMember();
  if (!member?.isOrganizer) redirect("/");
  return member;
}
