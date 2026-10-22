import { requireOrganizer } from "@/app/current-member";
import { NewPollForm } from "@/components/app/new-poll-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listMembers } from "@/features/members/server";

export default async function NewPollPage() {
  await requireOrganizer();
  const members = await listMembers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>새 날짜 투표</h1>
        </CardTitle>
        <CardDescription>
          팀원은 후보 날짜 중 가능한 날을 여러 개 고릅니다. 대상은 명단 전체 또는 고른 소그룹입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NewPollForm members={members.map((m) => ({ id: m.id, name: m.name }))} />
      </CardContent>
    </Card>
  );
}
