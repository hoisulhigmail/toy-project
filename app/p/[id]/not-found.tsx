import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export default function PollNotFound() {
  return (
    <PageShell>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            <h1>투표를 찾을 수 없습니다</h1>
          </EmptyTitle>
          <EmptyDescription>삭제되었거나 주소가 잘못된 투표입니다. 총무에게 문의해 주세요.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            첫 화면으로
          </Link>
        </EmptyContent>
      </Empty>
    </PageShell>
  );
}
