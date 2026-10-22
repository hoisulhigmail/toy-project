"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Member = { id: string; name: string };

// Chooses between the whole roster and a small group picked from it.
export function AudiencePicker({ members }: { members: Member[] }) {
  const [kind, setKind] = useState<"all" | "group">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = members.filter((member) => member.name.includes(query.trim()));

  function update(ids: string[], checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  return (
    <FieldSet>
      <FieldLegend>투표 대상</FieldLegend>
      <input type="hidden" name="audience" value={kind} />
      <RadioGroup value={kind} onValueChange={(value) => setKind(value as "all" | "group")}>
        <Field orientation="horizontal">
          <RadioGroupItem value="all" id="audience-all" />
          <FieldLabel htmlFor="audience-all" className="font-normal">
            명단 전체 ({members.length}명)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="group" id="audience-group" />
          <FieldLabel htmlFor="audience-group" className="font-normal">
            소그룹
          </FieldLabel>
        </Field>
      </RadioGroup>

      {kind === "group" && (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="search"
              aria-label="이름으로 찾기"
              placeholder="이름으로 찾기"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="max-w-xs"
            />
            <Button type="button" variant="outline" size="sm" onClick={() => update(visible.map((m) => m.id), true)}>
              보이는 사람 전체 선택
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              선택 해제
            </Button>
          </div>
          <FieldDescription>{selected.size}명 선택됨</FieldDescription>
          <div className="grid gap-2 sm:grid-cols-3">
            {visible.map((member) => (
              <Field key={member.id} orientation="horizontal">
                <Checkbox
                  id={`target-${member.id}`}
                  checked={selected.has(member.id)}
                  onCheckedChange={(checked) => update([member.id], checked)}
                />
                <FieldLabel htmlFor={`target-${member.id}`} className="font-normal">
                  {member.name}
                </FieldLabel>
              </Field>
            ))}
          </div>
          {[...selected].map((id) => (
            <input key={id} type="hidden" name="targetId" value={id} />
          ))}
        </div>
      )}
    </FieldSet>
  );
}
