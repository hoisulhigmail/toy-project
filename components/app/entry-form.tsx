"use client";

import { useActionState } from "react";

import { enter, type EntryState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function EntryForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<EntryState, FormData>(enter, {});
  const invalid = state.error ? true : undefined;

  return (
    <form action={action}>
      <FieldGroup>
        {next && <input type="hidden" name="next" value={next} />}
        <Field data-invalid={invalid}>
          <FieldLabel htmlFor="name">이름</FieldLabel>
          <Input id="name" name="name" autoComplete="name" required aria-invalid={invalid} />
        </Field>
        <Field data-invalid={invalid}>
          <FieldLabel htmlFor="employeeNo">사번</FieldLabel>
          <Input id="employeeNo" name="employeeNo" required aria-invalid={invalid} />
          <FieldError>{state.error}</FieldError>
        </Field>
        <Button type="submit" disabled={pending}>
          입장하기
        </Button>
      </FieldGroup>
    </form>
  );
}
