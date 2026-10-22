"use client";

import { useTransition } from "react";

import { setOrganizerAction } from "@/app/admin/actions";
import { Switch } from "@/components/ui/switch";

export function OrganizerSwitch({
  memberId,
  memberName,
  checked,
  disabled,
}: {
  memberId: string;
  memberName: string;
  checked: boolean;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={checked}
      disabled={disabled || pending}
      aria-label={`${memberName} 총무`}
      onCheckedChange={(next) => startTransition(() => setOrganizerAction(memberId, next))}
    />
  );
}
