import Link from "next/link";

import { requireOrganizer } from "@/app/current-member";
import { CopyButton } from "@/components/app/copy-button";
import { DeletePollButton } from "@/components/app/delete-poll-button";
import { DownloadButton } from "@/components/app/download-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { isTestMember, joinEmails } from "@/features/members";
import { listMembers } from "@/features/members/server";
import {
  buildAnnouncement,
  buildResultRecord,
  eligibleMemberIds,
  formatKst,
  isClosed,
  optionLabel,
  tallyPoll,
  type PollResult,
} from "@/features/polls";
import { listBallotEntries, listPolls } from "@/features/polls/server";

export default async function AdminPollsPage() {
  // The layout already checks, but pages render in parallel with layouts.
  await requireOrganizer();
  const [members, polls] = await Promise.all([listMembers(), listPolls()]);
  const entries = await listBallotEntries(polls.map((poll) => poll.id));
  const memberIds = members.map((member) => member.id);
  const testIds = members.filter(isTestMember).map((member) => member.id);
  const now = new Date();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">투표 목록</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/polls/new" className={buttonVariants()}>
            새 날짜 투표
          </Link>
          <Link href="/admin/polls/new?kind=item" className={buttonVariants({ variant: "secondary" })}>
            새 항목 투표
          </Link>
        </div>
      </div>

      {polls.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>아직 만든 투표가 없습니다</EmptyTitle>
            <EmptyDescription>날짜 투표나 항목 투표를 만들고 공유 URL을 팀에 보내 보세요.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/admin/polls/new" className={buttonVariants({ variant: "outline" })}>
              새 날짜 투표
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        polls.map((poll) => {
          const eligible = new Set(eligibleMemberIds(poll.audience, memberIds, testIds));
          const isGroup = poll.audience.kind === "group";
          const tally = tallyPoll({
            options: poll.options,
            ballots: entries.filter((entry) => entry.pollId === poll.id),
            eligibleMemberIds: [...eligible],
          });
          const voted = new Set(tally.voterIds);
          const nonVoters = members.filter((member) => eligible.has(member.id) && !voted.has(member.id));
          const closed = isClosed(poll.deadline, now);
          const sharePath = `/p/${poll.id}`;
          const result: PollResult = {
            kind: poll.kind,
            title: poll.title,
            description: poll.description,
            audience: poll.audience.kind,
            deadline: poll.deadline,
            voterCount: tally.voterCount,
            eligibleCount: eligible.size,
            options: poll.options.map((o) => ({ label: optionLabel(poll.kind, o.value), count: tally.counts[o.id] })),
          };
          const record = closed ? buildResultRecord(result) : null;

          return (
            <Card key={poll.id}>
              <CardHeader>
                <CardTitle>{poll.title}</CardTitle>
                <CardDescription>마감 {formatKst(poll.deadline)}</CardDescription>
                <CardAction className="flex gap-1">
                  <Badge variant="secondary">{poll.kind === "item" ? "항목" : "날짜"}</Badge>
                  {isGroup && <Badge variant="outline">소그룹 {eligible.size}명</Badge>}
                  <Badge variant={closed ? "secondary" : "default"}>{closed ? "마감" : "진행 중"}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm">
                  투표 완료 <strong>{tally.voterCount}</strong> / {isGroup ? "대상" : "전체"} {eligible.size}
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-medium">미투표자 {nonVoters.length}명</h2>
                    <CopyButton
                      label="미투표자 메일 복사"
                      value={joinEmails(nonVoters)}
                      copiedLabel="메일 주소를 복사했습니다"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {nonVoters.length === 0 ? "모두 투표했습니다." : nonVoters.map((m) => m.name).join(", ")}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <CopyButton label="공유 URL 복사" path={sharePath} copiedLabel="URL을 복사했습니다" />
                <Link href={sharePath} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  투표하러 가기
                </Link>
                {record && (
                  <>
                    <CopyButton
                      label="공지 메일 복사"
                      value={buildAnnouncement(result)}
                      copiedLabel="공지 메일을 복사했습니다"
                    />
                    <DownloadButton label="Markdown 받기" fileName={record.fileName} content={record.markdown} />
                  </>
                )}
                <DeletePollButton pollId={poll.id} title={poll.title} />
              </CardFooter>
            </Card>
          );
        })
      )}
    </>
  );
}
