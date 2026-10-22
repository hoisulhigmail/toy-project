"use client";

import { useActionState, useState } from "react";

import { submitBallotAction, type BallotState } from "@/app/p/[id]/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";

export function BallotForm({
  pollId,
  dates,
  initialDateIds,
}: {
  pollId: string;
  dates: { id: string; label: string }[];
  initialDateIds: string[];
}) {
  const [state, action, pending] = useActionState<BallotState, FormData>(
    submitBallotAction.bind(null, pollId),
    {}
  );
  const [selected, setSelected] = useState(() => new Set(initialDateIds));

  function toggle(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <form action={action}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>가능한 날을 모두 골라 주세요</FieldLegend>
          <FieldGroup className="gap-3">
            {dates.map((date) => (
              <Field key={date.id} orientation="horizontal">
                <Checkbox
                  id={`date-${date.id}`}
                  checked={selected.has(date.id)}
                  onCheckedChange={(checked) => toggle(date.id, checked)}
                />
                <FieldLabel htmlFor={`date-${date.id}`} className="font-normal">
                  {date.label}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
        {[...selected].map((id) => (
          <input key={id} type="hidden" name="dateId" value={id} />
        ))}
        <FieldError>{state.error}</FieldError>
        <Button type="submit" disabled={pending || selected.size === 0} className="self-start">
          {initialDateIds.length > 0 ? "수정해서 제출하기" : "투표 제출하기"}
        </Button>
      </FieldGroup>
    </form>
  );
}
