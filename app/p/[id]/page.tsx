import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentMember } from "@/app/current-member";
import { BallotForm } from "@/components/app/ballot-form";
import { PageShell } from "@/components/app/page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { isTestMember } from "@/features/members";
import { listMembers } from "@/features/members/server";
import { eligibleMemberIds, formatKst, isClosed, optionLabel, tallyPoll } from "@/features/polls";
import { getPoll, listBallotEntries } from "@/features/polls/server";

export default async function PollPage({ params, searchParams }: PageProps<"/p/[id]">) {
  const { id } = await params;
  const { edit } = await searchParams;

  const member = await getCurrentMember();
  if (!member) redirect(`/?next=/p/${id}`);

  const poll = await getPoll(id);
  if (!poll) notFound();

  const [members, entries] = await Promise.all([listMembers(), listBallotEntries([poll.id])]);
  const eligible = eligibleMemberIds(
    poll.audience,
    members.map((m) => m.id),
    members.filter(isTestMember).map((m) => m.id)
  );

  // Outside a small group, nothing about the poll is shown.
  if (!eligible.includes(member.id)) {
    return (
      <PageShell memberName={member.name}>
        <Alert>
          <AlertTitle>
            <h1>이 투표의 대상이 아닙니다</h1>
          </AlertTitle>
          <AlertDescription>투표 대상이 맞다면 총무에게 문의해 주세요.</AlertDescription>
        </Alert>
      </PageShell>
    );
  }

  const audienceLabel = poll.audience.kind === "group" ? "대상" : "전체";
  const tally = tallyPoll({
    options: poll.options,
    ballots: entries,
    eligibleMemberIds: eligible,
  });
  const myOptionIds = entries.filter((entry) => entry.memberId === member.id).map((entry) => entry.optionId);
  const closed = isClosed(poll.deadline);
  const showForm = !closed && (myOptionIds.length === 0 || edit === "1");
  const top = new Set(tally.topOptionIds);
  const isItem = poll.kind === "item";

  return (
    <PageShell memberName={member.name}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>{poll.title}</h1>
          </CardTitle>
          <CardDescription>마감 {formatKst(poll.deadline)}</CardDescription>
        </CardHeader>
        {poll.description && (
          <CardContent>
            <p className="whitespace-pre-line">{poll.description}</p>
          </CardContent>
        )}
      </Card>

      {closed && (
        <Alert>
          <AlertTitle>마감된 투표입니다</AlertTitle>
          <AlertDescription>더 이상 투표하거나 선택을 바꿀 수 없습니다.</AlertDescription>
        </Alert>
      )}

      {showForm ? (
        <Card>
          <CardContent>
            <BallotForm
              pollId={poll.id}
              legend={isItem ? "마음에 드는 항목을 모두 골라 주세요" : "가능한 날을 모두 골라 주세요"}
              options={poll.options.map((o) => ({ id: o.id, label: optionLabel(poll.kind, o.value) }))}
              initialOptionIds={myOptionIds}
              allAvailable={poll.allAvailable}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>현재 결과</h2>
            </CardTitle>
            <CardDescription>
              {tally.voterCount}명 투표 · {audienceLabel} {eligible.length}명
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {poll.options.map((option) => {
                const isTop = top.has(option.id);
                return (
                  <li
                    key={option.id}
                    data-top={isTop || undefined}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border px-4 py-3",
                      isTop && "border-primary bg-primary/10"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {optionLabel(poll.kind, option.value)}
                      {isTop && <Badge>{isItem ? "가장 많이 선택" : "가장 많이 가능"}</Badge>}
                    </span>
                    <span className="font-medium tabular-nums">{tally.counts[option.id]}표</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
          {!closed && (
            <CardFooter>
              <Link href={`/p/${poll.id}?edit=1`} className={buttonVariants({ variant: "outline" })}>
                선택 수정하기
              </Link>
            </CardFooter>
          )}
        </Card>
      )}
    </PageShell>
  );
}
