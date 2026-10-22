import Link from "next/link";

import { requireOrganizer } from "@/app/current-member";
import { PageShell } from "@/components/app/page-shell";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const organizer = await requireOrganizer();

  return (
    <PageShell
      memberName={organizer.name}
      nav={
        <>
          <Link href="/admin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            투표 목록
          </Link>
          <Link href="/admin/members" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            인원 명단
          </Link>
        </>
      }
    >
      {children}
    </PageShell>
  );
}
