"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

// Copies `value`, or the absolute URL for `path`, and confirms briefly.
export function CopyButton({
  value,
  path,
  label,
  copiedLabel = "복사했습니다",
}: {
  value?: string;
  path?: string;
  label: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const disabled = !value && !path;

  async function copy() {
    const text = path ? new URL(path, window.location.origin).toString() : (value ?? "");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} disabled={disabled}>
      {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
