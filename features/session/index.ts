import "server-only";

import { cookies } from "next/headers";

const COOKIE = "tally_member";
const ONE_YEAR = 60 * 60 * 24 * 365;

// Entry is remembered per browser until the person leaves. This identifies
// a roster entry; it is not authentication (see docs/decisions/team-identity.md).
export async function getSessionMemberId(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

export async function startSession(memberId: string): Promise<void> {
  (await cookies()).set(COOKIE, memberId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
