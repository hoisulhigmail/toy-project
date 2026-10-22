import "server-only";

import { db } from "@/lib/supabase";

import type { NewMember } from "./rules";

export type Member = {
  id: string;
  name: string;
  employeeNo: string;
  email: string;
  isOrganizer: boolean;
};

type MemberRow = {
  id: string;
  name: string;
  employee_no: string;
  email: string;
  is_organizer: boolean;
};

const COLUMNS = "id, name, employee_no, email, is_organizer";

function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name,
    employeeNo: row.employee_no,
    email: row.email,
    isOrganizer: row.is_organizer,
  };
}

export async function listMembers(): Promise<Member[]> {
  const { data, error } = await db().from("members").select(COLUMNS).order("created_at");
  if (error) throw error;
  return (data as MemberRow[]).map(toMember);
}

export async function getMember(id: string): Promise<Member | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("members").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toMember(data as MemberRow) : null;
}

// Entry requires both the name and the employee number to match one person.
export async function findMemberForEntry(name: string, employeeNo: string): Promise<Member | null> {
  const { data, error } = await db()
    .from("members")
    .select(COLUMNS)
    .eq("employee_no", employeeNo.trim())
    .eq("name", name.trim())
    .maybeSingle();
  if (error) throw error;
  return data ? toMember(data as MemberRow) : null;
}

export async function addMember(
  member: NewMember
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await db()
    .from("members")
    .insert({ name: member.name, employee_no: member.employeeNo, email: member.email });
  if (error?.code === "23505") return { ok: false, error: "이미 명단에 있는 사번입니다." };
  if (error) throw error;
  return { ok: true };
}

export async function removeMember(id: string): Promise<void> {
  const { error } = await db().from("members").delete().eq("id", id);
  if (error) throw error;
}

export async function setOrganizer(id: string, isOrganizer: boolean): Promise<void> {
  const { error } = await db().from("members").update({ is_organizer: isOrganizer }).eq("id", id);
  if (error) throw error;
}
