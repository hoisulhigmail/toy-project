import { requireOrganizer } from "@/app/current-member";
import { NewPollForm } from "@/components/app/new-poll-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listMembers } from "@/features/members/server";

// ?kind=item opens the item poll form; anything else is a date poll.
export default async function NewPollPage({ searchParams }: PageProps<"/admin/polls/new">) {
  await requireOrganizer();
  const { kind } = await searchParams;
  const isItem = kind === "item";
  const members = await listMembers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>{isItem ? "새 항목 투표" : "새 날짜 투표"}</h1>
        </CardTitle>
        <CardDescription>
          {isItem
            ? "팀원은 후보 항목 중 마음에 드는 것을 여러 개 고릅니다."
            : "팀원은 후보 날짜 중 가능한 날을 여러 개 고릅니다."}{" "}
          대상은 명단 전체 또는 고른 소그룹입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NewPollForm
          key={isItem ? "item" : "date"}
          kind={isItem ? "item" : "date"}
          members={members.map((m) => ({ id: m.id, name: m.name }))}
        />
      </CardContent>
    </Card>
  );
}
