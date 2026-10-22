"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/app/current-member";
import { validateNewMember } from "@/features/members";
import { addMember, removeMember, setOrganizer } from "@/features/members/server";
import { validateNewItemPoll, validateNewPoll } from "@/features/polls";
import { createDatePoll, createItemPoll, deletePoll } from "@/features/polls/server";

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
  const common = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    deadline: String(formData.get("deadline") ?? ""),
    audience:
      formData.get("audience") === "group"
        ? { kind: "group" as const, memberIds: formData.getAll("targetId").map(String) }
        : { kind: "all" as const },
  };

  if (formData.get("kind") === "item") {
    const result = validateNewItemPoll({ ...common, items: formData.getAll("item").map(String) });
    if (!result.ok) return { error: result.error };
    await createItemPoll(result.value);
  } else {
    const result = validateNewPoll({ ...common, dates: formData.getAll("date").map(String) });
    if (!result.ok) return { error: result.error };
    await createDatePoll(result.value, formData.get("allAvailable") === "on");
  }
  redirect("/admin");
}

export async function deletePollAction(pollId: string): Promise<void> {
  await requireOrganizer();
  await deletePoll(pollId);
  revalidatePath("/admin");
}
