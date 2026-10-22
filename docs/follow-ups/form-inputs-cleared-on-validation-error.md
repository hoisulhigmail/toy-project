# 검증 오류가 나면 양식에 입력한 값이 모두 지워진다

**Symptom**: 입장, 사람 추가, 새 날짜 투표 양식에서 서버가 검증 오류를 돌려주면 오류 문구는 보이지만 입력한 값이 모두 비워집니다.

**Observed evidence**: `next dev`에서 `/`에 명단에 없는 사번으로 입장을 시도하자, "명단에 없는 이름과 사번입니다" 안내와 함께 이름 칸도 비워졌습니다(agent-browser snapshot). 같은 구조인 `components/app/add-member-form.tsx`와 `components/app/new-poll-form.tsx`도 2026-10-22 코드 리뷰(low)에서 함께 지적됐습니다.

**Suspected cause**: React 19는 `<form action>`의 action이 끝나면 비제어 입력을 초기화합니다. 세 양식 모두 `useActionState`와 비제어 `Input`을 씁니다(추정).

**What was tried**: 수정하지 않았습니다. 인수 기준은 모두 통과하고, 다시 입력하면 진행할 수 있습니다.

**Proposed next step**: action이 받은 값을 state로 돌려주고 각 입력의 `defaultValue`로 다시 채우는 방식을 한 양식에 적용해 본 뒤, 나머지 두 양식에도 같은 방식을 적용합니다.
