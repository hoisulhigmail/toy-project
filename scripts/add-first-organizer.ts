// Registers the first 총무 so someone can enter and manage the roster.
// Usage: bun scripts/add-first-organizer.ts <name> <employeeNo> <email>
// Bun loads SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local.
import { createClient } from "@supabase/supabase-js";

import { validateNewMember } from "@/features/members";

const [name = "", employeeNo = "", email = ""] = process.argv.slice(2);
const result = validateNewMember({ name, employeeNo, email });
if (!result.ok) {
  console.error(`${result.error}\nUsage: bun scripts/add-first-organizer.ts <name> <employeeNo> <email>`);
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) {
  console.error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local");
  process.exit(1);
}

const db = createClient(url, secretKey, { auth: { persistSession: false } });
const { error } = await db.from("members").upsert(
  {
    name: result.value.name,
    employee_no: result.value.employeeNo,
    email: result.value.email,
    is_organizer: true,
  },
  { onConflict: "employee_no" }
);
if (error) {
  console.error(error.message);
  process.exit(1);
}
console.log(`${result.value.name} (${result.value.employeeNo}) is now a 총무.`);
