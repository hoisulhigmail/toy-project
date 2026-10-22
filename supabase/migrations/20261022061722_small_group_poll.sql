-- Small-group polls: a poll's audience is either the whole roster ('all')
-- or the members chosen at creation ('group'), stored in poll_targets.

alter table public.polls
  add column audience text not null default 'all'
  check (audience in ('all', 'group'));

create table public.poll_targets (
  poll_id uuid not null references public.polls (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  primary key (poll_id, member_id)
);

create index poll_targets_member_id_idx on public.poll_targets (member_id);

alter table public.poll_targets enable row level security;
revoke all on public.poll_targets from public, anon, authenticated;
grant select, insert, update, delete on public.poll_targets to service_role;

drop function public.create_date_poll (text, text, timestamptz, date[]);

-- p_member_ids null means the whole roster; otherwise a small group.
create function public.create_date_poll(
  p_title text,
  p_description text,
  p_deadline timestamptz,
  p_dates date[],
  p_member_ids uuid[] default null
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_poll_id uuid;
begin
  if coalesce(array_length(p_dates, 1), 0) = 0 then
    raise exception 'no_dates';
  end if;
  if p_member_ids is not null and coalesce(array_length(p_member_ids, 1), 0) = 0 then
    raise exception 'no_targets';
  end if;

  insert into public.polls (title, description, deadline, audience)
  values (
    p_title,
    coalesce(p_description, ''),
    p_deadline,
    case when p_member_ids is null then 'all' else 'group' end
  )
  returning id into v_poll_id;

  insert into public.poll_dates (poll_id, candidate_date)
  select distinct v_poll_id, d from unnest(p_dates) as d;

  if p_member_ids is not null then
    insert into public.poll_targets (poll_id, member_id)
    select distinct v_poll_id, m.id
    from unnest(p_member_ids) as chosen (id)
    join public.members m on m.id = chosen.id;
  end if;

  return v_poll_id;
end;
$$;

create or replace function public.submit_ballot(
  p_poll_id uuid,
  p_member_id uuid,
  p_date_ids bigint[]
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_deadline timestamptz;
  v_audience text;
begin
  select deadline, audience into v_deadline, v_audience
  from public.polls where id = p_poll_id;
  if v_deadline is null then
    raise exception 'poll_not_found';
  end if;
  if now() >= v_deadline then
    raise exception 'poll_closed';
  end if;
  if not exists (select 1 from public.members where id = p_member_id) then
    raise exception 'member_not_found';
  end if;
  if v_audience = 'group' and not exists (
    select 1 from public.poll_targets
    where poll_id = p_poll_id and member_id = p_member_id
  ) then
    raise exception 'not_target';
  end if;
  if coalesce(array_length(p_date_ids, 1), 0) = 0 then
    raise exception 'no_dates';
  end if;
  if exists (
    select 1 from unnest(p_date_ids) as chosen (id)
    where not exists (
      select 1 from public.poll_dates pd
      where pd.id = chosen.id and pd.poll_id = p_poll_id
    )
  ) then
    raise exception 'invalid_date';
  end if;

  delete from public.ballot_choices
  where poll_id = p_poll_id and member_id = p_member_id;

  insert into public.ballot_choices (poll_id, member_id, poll_date_id)
  select distinct p_poll_id, p_member_id, chosen.id
  from unnest(p_date_ids) as chosen (id);
end;
$$;

revoke execute on function public.create_date_poll (text, text, timestamptz, date[], uuid[])
  from public, anon, authenticated;
grant execute on function public.create_date_poll (text, text, timestamptz, date[], uuid[])
  to service_role;

notify pgrst, 'reload schema';
