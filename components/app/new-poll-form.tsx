"use client";

import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useActionState, useState } from "react";

import { createPollAction, type FormState } from "@/app/admin/actions";
import { AudiencePicker } from "@/components/app/audience-picker";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function NewPollForm({ members }: { members: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createPollAction, {});
  const [dateKeys, setDateKeys] = useState([0]);
  const [nextKey, setNextKey] = useState(1);

  function addDate() {
    setDateKeys((keys) => [...keys, nextKey]);
    setNextKey((key) => key + 1);
  }

  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="poll-title">제목</FieldLabel>
          <Input id="poll-title" name="title" placeholder="예: 가을 야유회 날짜" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="poll-description">설명</FieldLabel>
          <Textarea id="poll-description" name="description" placeholder="팀원이 투표 화면에서 가장 먼저 보는 안내입니다." />
        </Field>
        <FieldSet>
          <FieldLegend>후보 날짜</FieldLegend>
          <FieldDescription>같은 날짜는 한 번만 들어갑니다.</FieldDescription>
          <div className="flex flex-col gap-2">
            {dateKeys.map((key, index) => (
              <div key={key} className="flex items-center gap-2">
                <Input type="date" name="date" aria-label={`후보 날짜 ${index + 1}`} required={index === 0} />
                {dateKeys.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`후보 날짜 ${index + 1} 빼기`}
                    onClick={() => setDateKeys((keys) => keys.filter((k) => k !== key))}
                  >
                    <XIcon />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={addDate}>
            <PlusIcon data-icon="inline-start" />
            날짜 추가
          </Button>
        </FieldSet>
        <Field>
          <FieldLabel htmlFor="poll-deadline">마감 일시</FieldLabel>
          <Input id="poll-deadline" name="deadline" type="datetime-local" required />
          <FieldDescription>한국 시간 기준입니다. 마감이 지나면 투표와 수정이 막힙니다.</FieldDescription>
        </Field>
        <AudiencePicker members={members} />
        <FieldError>{state.error}</FieldError>
        <Button type="submit" disabled={pending} className="self-start">
          투표 만들기
        </Button>
      </FieldGroup>
    </form>
  );
}
