import { removeMemberAction } from "@/app/admin/actions";
import { requireOrganizer } from "@/app/current-member";
import { AddMemberForm } from "@/components/app/add-member-form";
import { OrganizerSwitch } from "@/components/app/organizer-switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listMembers } from "@/features/members/server";

export default async function MembersPage() {
  const organizer = await requireOrganizer();
  const members = await listMembers();

  return (
    <>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">인원 명단</h1>

      <Card>
        <CardHeader>
          <CardTitle>사람 추가</CardTitle>
          <CardDescription>추가한 사람은 진행 중인 투표의 대상에도 바로 포함됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddMemberForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>명단 {members.length}명</CardTitle>
          <CardDescription>총무를 켜면 그 사람도 다음 입장부터 총무 화면을 쓸 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>사번</TableHead>
                  <TableHead>메일 주소</TableHead>
                  <TableHead>총무</TableHead>
                  <TableHead className="sr-only">삭제</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.employeeNo}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <OrganizerSwitch
                        memberId={member.id}
                        memberName={member.name}
                        checked={member.isOrganizer}
                        disabled={member.id === organizer.id}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {member.id !== organizer.id && (
                        <form action={removeMemberAction}>
                          <input type="hidden" name="memberId" value={member.id} />
                          <Button type="submit" variant="destructive" size="sm" aria-label={`${member.name} 삭제`}>
                            삭제
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
