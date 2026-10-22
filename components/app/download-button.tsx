"use client";

import { DownloadSimpleIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

// Saves `content` as a local file named `fileName`.
export function DownloadButton({
  label,
  fileName,
  content,
  type = "text/markdown;charset=utf-8",
}: {
  label: string;
  fileName: string;
  content: string;
  type?: string;
}) {
  function download() {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    // Revoking right away cancels the download, so wait until it has started.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={download}>
      <DownloadSimpleIcon data-icon="inline-start" />
      {label}
    </Button>
  );
}
