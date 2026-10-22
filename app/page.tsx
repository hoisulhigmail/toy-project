import Link from "next/link";

import { getCurrentMember } from "@/app/current-member";
import { EntryForm } from "@/components/app/entry-form";
import { PageShell } from "@/components/app/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { next } = await searchParams;
  const member = await getCurrentMember();

  if (member) {
    return (
      <PageShell memberName={member.name}>
        <Card>
          <CardHeader>
            <CardTitle>
              <h1>{member.name}님, 입장했습니다</h1>
            </CardTitle>
            <CardDescription>총무에게 받은 투표 링크를 열면 바로 투표할 수 있습니다.</CardDescription>
          </CardHeader>
          {member.isOrganizer && (
            <CardContent>
              <Link href="/admin" className={buttonVariants()}>
                총무 화면으로 가기
              </Link>
            </CardContent>
          )}
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Card className="w-full max-w-sm self-center">
        <CardHeader>
          <CardTitle>
            <h1>Tally에 입장하기</h1>
          </CardTitle>
          <CardDescription>인원 명단에 등록된 이름과 사번을 입력해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <EntryForm next={typeof next === "string" ? next : undefined} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
