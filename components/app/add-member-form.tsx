"use client";

import { useActionState, useEffect, useRef } from "react";

import { addMemberAction, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AddMemberForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addMemberAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="member-name">이름</FieldLabel>
            <Input id="member-name" name="name" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="member-employee-no">사번</FieldLabel>
            <Input id="member-employee-no" name="employeeNo" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="member-email">메일 주소</FieldLabel>
            <Input id="member-email" name="email" type="email" required />
          </Field>
        </div>
        <FieldError>{state.error}</FieldError>
        <Button type="submit" disabled={pending} className="self-start">
          추가하기
        </Button>
      </FieldGroup>
    </form>
  );
}
