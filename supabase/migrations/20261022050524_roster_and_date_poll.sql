-- Roster, date polls and ballots for Tally.
-- Every table is reachable only through the server's secret key: RLS is on
-- with no policies, and anon/authenticated hold no privileges.

create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  employee_no text not null unique check (length(btrim(employee_no)) > 0),
  email text not null check (length(btrim(email)) > 0),
  is_organizer boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  description text not null default '',
  deadline timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.poll_dates (
  id bigint generated always as identity primary key,
  poll_id uuid not null references public.polls (id) on delete cascade,
  candidate_date date not null,
  unique (poll_id, candidate_date)
);

create table public.ballot_choices (
  poll_id uuid not null references public.polls (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  poll_date_id bigint not null references public.poll_dates (id) on delete cascade,
  primary key (poll_id, member_id, poll_date_id)
);

create index ballot_choices_member_id_idx on public.ballot_choices (member_id);
create index ballot_choices_poll_date_id_idx on public.ballot_choices (poll_date_id);

alter table public.members enable row level security;
alter table public.polls enable row level security;
alter table public.poll_dates enable row level security;
alter table public.ballot_choices enable row level security;

revoke all on public.members, public.polls, public.poll_dates, public.ballot_choices
  from public, anon, authenticated;
grant select, insert, update, delete
  on public.members, public.polls, public.poll_dates, public.ballot_choices
  to service_role;

-- Creates a poll together with its candidate dates in one transaction.
create function public.create_date_poll(
  p_title text,
  p_description text,
  p_deadline timestamptz,
  p_dates date[]
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

  insert into public.polls (title, description, deadline)
  values (p_title, coalesce(p_description, ''), p_deadline)
  returning id into v_poll_id;

  insert into public.poll_dates (poll_id, candidate_date)
  select distinct v_poll_id, d from unnest(p_dates) as d;

  return v_poll_id;
end;
$$;

-- Replaces one member's choices for a poll, so a person always counts once.
create function public.submit_ballot(
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
begin
  select deadline into v_deadline from public.polls where id = p_poll_id;
  if v_deadline is null then
    raise exception 'poll_not_found';
  end if;
  if now() >= v_deadline then
    raise exception 'poll_closed';
  end if;
  if not exists (select 1 from public.members where id = p_member_id) then
    raise exception 'member_not_found';
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

revoke execute on function public.create_date_poll (text, text, timestamptz, date[])
  from public, anon, authenticated;
revoke execute on function public.submit_ballot (uuid, uuid, bigint[])
  from public, anon, authenticated;
grant execute on function public.create_date_poll (text, text, timestamptz, date[])
  to service_role;
grant execute on function public.submit_ballot (uuid, uuid, bigint[])
  to service_role;
