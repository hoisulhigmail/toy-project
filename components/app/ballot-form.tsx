"use client";

import { useActionState, useState } from "react";

import { submitBallotAction, type BallotState } from "@/app/p/[id]/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";

export function BallotForm({
  pollId,
  legend,
  options,
  initialOptionIds,
}: {
  pollId: string;
  legend: string;
  options: { id: string; label: string }[];
  initialOptionIds: string[];
}) {
  const [state, action, pending] = useActionState<BallotState, FormData>(
    submitBallotAction.bind(null, pollId),
    {}
  );
  const [selected, setSelected] = useState(() => new Set(initialOptionIds));

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
          <FieldLegend>{legend}</FieldLegend>
          <FieldGroup className="gap-3">
            {options.map((option) => (
              <Field key={option.id} orientation="horizontal">
                <Checkbox
                  id={`option-${option.id}`}
                  checked={selected.has(option.id)}
                  onCheckedChange={(checked) => toggle(option.id, checked)}
                />
                <FieldLabel htmlFor={`option-${option.id}`} className="font-normal">
                  {option.label}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
        {[...selected].map((id) => (
          <input key={id} type="hidden" name="optionId" value={id} />
        ))}
        <FieldError>{state.error}</FieldError>
        <Button type="submit" disabled={pending || selected.size === 0} className="self-start">
          {initialOptionIds.length > 0 ? "수정해서 제출하기" : "투표 제출하기"}
        </Button>
      </FieldGroup>
    </form>
  );
}
