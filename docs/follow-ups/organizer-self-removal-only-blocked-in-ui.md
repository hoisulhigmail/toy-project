# 총무가 자기 자신을 삭제하거나 총무에서 빼는 것을 UI에서만 막는다

**Symptom**: 인원 명단 화면은 입장한 총무 자신의 삭제 버튼과 총무 스위치를 막지만, 서버 action은 같은 요청을 거절하지 않습니다.

**Observed evidence**: `app/admin/actions.ts`의 `removeMemberAction`과 `setOrganizerAction`은 `requireOrganizer()`만 확인하고 대상이 호출한 사람 본인인지는 보지 않습니다. 2026-10-22 코드 리뷰(low)에서 지적됐고, 브라우저 화면에서는 재현되지 않습니다.

**Suspected cause**: 자기 잠금 방지를 `app/admin/members/page.tsx`의 `disabled` 처리로만 구현했습니다.

**What was tried**: 수정하지 않았습니다. 스펙이 요구하지 않은 하드닝이라 이 프로젝트의 검증 예산 밖입니다.

**Proposed next step**: 두 action에서 대상 `memberId`가 `requireOrganizer()`가 돌려준 id와 같으면 아무것도 하지 않도록 한 줄 검사를 추가합니다.
