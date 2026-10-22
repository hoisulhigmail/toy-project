"use server";

import { redirect } from "next/navigation";

import { getCurrentMember } from "@/app/current-member";
import { submitBallot } from "@/features/polls/server";

export type BallotState = { error?: string };

export async function submitBallotAction(
  pollId: string,
  _prev: BallotState,
  formData: FormData
): Promise<BallotState> {
  const member = await getCurrentMember();
  if (!member) redirect(`/?next=/p/${pollId}`);

  const optionIds = formData.getAll("optionId").map(String);
  if (optionIds.length === 0) return { error: "하나 이상 골라 주세요." };

  const result = await submitBallot(pollId, member.id, optionIds);
  if (!result.ok) return { error: result.error };

  redirect(`/p/${pollId}`);
}
