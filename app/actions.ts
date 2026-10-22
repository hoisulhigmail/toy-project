"use server";

import { redirect } from "next/navigation";

import { findMemberForEntry } from "@/features/members/server";
import { endSession, startSession } from "@/features/session";

export type EntryState = { error?: string };

function safeNext(value: FormDataEntryValue | null): string | null {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function enter(_prev: EntryState, formData: FormData): Promise<EntryState> {
  const name = String(formData.get("name") ?? "").trim();
  const employeeNo = String(formData.get("employeeNo") ?? "").trim();
  if (!name || !employeeNo) return { error: "이름과 사번을 모두 입력해 주세요." };

  const member = await findMemberForEntry(name, employeeNo);
  if (!member) return { error: "명단에 없는 이름과 사번입니다. 총무에게 문의해 주세요." };

  await startSession(member.id);
  redirect(safeNext(formData.get("next")) ?? (member.isOrganizer ? "/admin" : "/"));
}

export async function leave(): Promise<void> {
  await endSession();
  redirect("/");
}
