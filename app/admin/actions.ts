"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/app/current-member";
import { validateNewMember } from "@/features/members";
import { addMember, removeMember, setOrganizer } from "@/features/members/server";
import { validateNewPoll } from "@/features/polls";
import { createDatePoll } from "@/features/polls/server";

export type FormState = { error?: string; ok?: boolean };

// Server Actions are reachable by direct POST, so each one re-checks 총무.
export async function addMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireOrganizer();
  const result = validateNewMember({
    name: String(formData.get("name") ?? ""),
    employeeNo: String(formData.get("employeeNo") ?? ""),
    email: String(formData.get("email") ?? ""),
  });
  if (!result.ok) return { error: result.error };

  const added = await addMember(result.value);
  if (!added.ok) return { error: added.error };

  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function removeMemberAction(formData: FormData): Promise<void> {
  await requireOrganizer();
  await removeMember(String(formData.get("memberId")));
  revalidatePath("/admin", "layout");
}

export async function setOrganizerAction(memberId: string, isOrganizer: boolean): Promise<void> {
  await requireOrganizer();
  await setOrganizer(memberId, isOrganizer);
  revalidatePath("/admin", "layout");
}

export async function createPollAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireOrganizer();
  const result = validateNewPoll({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    dates: formData.getAll("date").map(String),
    deadline: String(formData.get("deadline") ?? ""),
  });
  if (!result.ok) return { error: result.error };

  await createDatePoll(result.value);
  redirect("/admin");
}
