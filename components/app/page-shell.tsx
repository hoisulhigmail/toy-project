import Link from "next/link";

import { leave } from "@/app/actions";
import { Button } from "@/components/ui/button";

// Shared page frame: content width, gutters and header live here so each
// screen only decides its own content order.
export function PageShell({
  children,
  memberName,
  nav,
}: {
  children: React.ReactNode;
  memberName?: string;
  nav?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-heading text-xl font-semibold tracking-tight">
          Tally
        </Link>
        {memberName && (
          <div className="flex flex-wrap items-center gap-2">
            {nav}
            <span className="text-sm text-muted-foreground">{memberName}님</span>
            <form action={leave}>
              <Button type="submit" variant="ghost" size="sm">
                나가기
              </Button>
            </form>
          </div>
        )}
      </header>
      <main className="flex flex-col gap-6">{children}</main>
    </div>
  );
}
