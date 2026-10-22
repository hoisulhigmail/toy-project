import { NewPollForm } from "@/components/app/new-poll-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPollPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>새 날짜 투표</h1>
        </CardTitle>
        <CardDescription>
          팀원은 후보 날짜 중 가능한 날을 여러 개 고릅니다. 대상은 현재 인원 명단 전체입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NewPollForm />
      </CardContent>
    </Card>
  );
}
