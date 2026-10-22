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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { PollKind } from "@/features/polls";

const COPY = {
  date: {
    titlePlaceholder: "예: 가을 야유회 날짜",
    legend: "후보 날짜",
    description: "같은 날짜는 한 번만 들어갑니다.",
    rowLabel: "후보 날짜",
    add: "날짜 추가",
    minRows: 1,
  },
  item: {
    titlePlaceholder: "예: 야유회 활동",
    legend: "후보 항목",
    description: "두 개 이상 넣어 주세요. 같은 항목은 한 번만 들어가고, 넣은 순서대로 보입니다.",
    rowLabel: "후보 항목",
    add: "항목 추가",
    minRows: 2,
  },
} as const;

export function NewPollForm({
  kind,
  members,
  wholeRosterCount,
}: {
  kind: PollKind;
  members: { id: string; name: string }[];
  wholeRosterCount: number;
}) {
  const copy = COPY[kind];
  const [state, action, pending] = useActionState<FormState, FormData>(createPollAction, {});
  const [rowKeys, setRowKeys] = useState(() => Array.from({ length: copy.minRows }, (_, i) => i));
  const [nextKey, setNextKey] = useState<number>(copy.minRows);
  const [allAvailable, setAllAvailable] = useState(true);

  function addRow() {
    setRowKeys((keys) => [...keys, nextKey]);
    setNextKey((key) => key + 1);
  }

  return (
    <form action={action}>
      <FieldGroup>
        <input type="hidden" name="kind" value={kind} />
        <Field>
          <FieldLabel htmlFor="poll-title">제목</FieldLabel>
          <Input id="poll-title" name="title" placeholder={copy.titlePlaceholder} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="poll-description">설명</FieldLabel>
          <Textarea id="poll-description" name="description" placeholder="팀원이 투표 화면에서 가장 먼저 보는 안내입니다." />
        </Field>
        <FieldSet>
          <FieldLegend>{copy.legend}</FieldLegend>
          <FieldDescription>{copy.description}</FieldDescription>
          <div className="flex flex-col gap-2">
            {rowKeys.map((key, index) => (
              <div key={key} className="flex items-center gap-2">
                {kind === "date" ? (
                  <Input type="date" name="date" aria-label={`${copy.rowLabel} ${index + 1}`} required={index === 0} />
                ) : (
                  <Input name="item" aria-label={`${copy.rowLabel} ${index + 1}`} placeholder="예: 볼링" />
                )}
                {rowKeys.length > copy.minRows && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${copy.rowLabel} ${index + 1} 빼기`}
                    onClick={() => setRowKeys((keys) => keys.filter((k) => k !== key))}
                  >
                    <XIcon />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={addRow}>
            <PlusIcon data-icon="inline-start" />
            {copy.add}
          </Button>
        </FieldSet>
        {kind === "date" && (
          <Field orientation="horizontal">
            <Switch id="poll-all-available" checked={allAvailable} onCheckedChange={setAllAvailable} />
            <FieldLabel htmlFor="poll-all-available" className="font-normal">
              모두가능 선택지 넣기
            </FieldLabel>
            {allAvailable && <input type="hidden" name="allAvailable" value="on" />}
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="poll-deadline">마감 일시</FieldLabel>
          <Input id="poll-deadline" name="deadline" type="datetime-local" required />
          <FieldDescription>한국 시간 기준입니다. 마감이 지나면 투표와 수정이 막힙니다.</FieldDescription>
        </Field>
        <AudiencePicker members={members} wholeRosterCount={wholeRosterCount} />
        <FieldError>{state.error}</FieldError>
        <Button type="submit" disabled={pending} className="self-start">
          투표 만들기
        </Button>
      </FieldGroup>
    </form>
  );
}
