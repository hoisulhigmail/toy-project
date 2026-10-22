-- Item polls: a poll is either a date poll or an item poll. Ballot choices
-- point at exactly one candidate date or one candidate item.

alter table public.polls
  add column kind text not null default 'date'
  check (kind in ('date', 'item'));

create table public.poll_items (
  id bigint generated always as identity primary key,
  poll_id uuid not null references public.polls (id) on delete cascade,
  label text not null check (length(btrim(label)) > 0),
  position integer not null,
  unique (poll_id, label)
);

alter table public.poll_items enable row level security;
revoke all on public.poll_items from public, anon, authenticated;
grant select, insert, update, delete on public.poll_items to service_role;

alter table public.ballot_choices drop constraint ballot_choices_pkey;
alter table public.ballot_choices
  add column id bigint generated always as identity primary key;
alter table public.ballot_choices alter column poll_date_id drop not null;
alter table public.ballot_choices
  add column poll_item_id bigint references public.poll_items (id) on delete cascade;
alter table public.ballot_choices
  add constraint ballot_choices_one_option check (num_nonnulls(poll_date_id, poll_item_id) = 1);
alter table public.ballot_choices
  add constraint ballot_choices_date_unique unique (poll_id, member_id, poll_date_id);
alter table public.ballot_choices
  add constraint ballot_choices_item_unique unique (poll_id, member_id, poll_item_id);

create index ballot_choices_poll_item_id_idx on public.ballot_choices (poll_item_id);

-- Creates an item poll with its candidate items (kept in typed order) and,
-- when p_member_ids is given, a small-group audience.
create function public.create_item_poll(
  p_title text,
  p_description text,
  p_deadline timestamptz,
  p_items text[],
  p_member_ids uuid[] default null
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_poll_id uuid;
begin
  if coalesce(array_length(p_items, 1), 0) < 2 then
    raise exception 'no_items';
  end if;
  if p_member_ids is not null and coalesce(array_length(p_member_ids, 1), 0) = 0 then
    raise exception 'no_targets';
  end if;

  insert into public.polls (title, description, deadline, audience, kind)
  values (
    p_title,
    coalesce(p_description, ''),
    p_deadline,
    case when p_member_ids is null then 'all' else 'group' end,
    'item'
  )
  returning id into v_poll_id;

  insert into public.poll_items (poll_id, label, position)
  select v_poll_id, item.label, item.ord
  from unnest(p_items) with ordinality as item (label, ord);

  if p_member_ids is not null then
    insert into public.poll_targets (poll_id, member_id)
    select distinct v_poll_id, m.id
    from unnest(p_member_ids) as chosen (id)
    join public.members m on m.id = chosen.id;
  end if;

  return v_poll_id;
end;
$$;

revoke execute on function public.create_item_poll (text, text, timestamptz, text[], uuid[])
  from public, anon, authenticated;
grant execute on function public.create_item_poll (text, text, timestamptz, text[], uuid[])
  to service_role;

-- p_date_ids keeps its name for compatibility; it holds candidate date ids
-- for a date poll and candidate item ids for an item poll.
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
  v_kind text;
begin
  select deadline, audience, kind into v_deadline, v_audience, v_kind
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

  if v_kind = 'item' then
    if exists (
      select 1 from unnest(p_date_ids) as chosen (id)
      where not exists (
        select 1 from public.poll_items pi
        where pi.id = chosen.id and pi.poll_id = p_poll_id
      )
    ) then
      raise exception 'invalid_date';
    end if;
  else
    if exists (
      select 1 from unnest(p_date_ids) as chosen (id)
      where not exists (
        select 1 from public.poll_dates pd
        where pd.id = chosen.id and pd.poll_id = p_poll_id
      )
    ) then
      raise exception 'invalid_date';
    end if;
  end if;

  delete from public.ballot_choices
  where poll_id = p_poll_id and member_id = p_member_id;

  if v_kind = 'item' then
    insert into public.ballot_choices (poll_id, member_id, poll_item_id)
    select distinct p_poll_id, p_member_id, chosen.id
    from unnest(p_date_ids) as chosen (id);
  else
    insert into public.ballot_choices (poll_id, member_id, poll_date_id)
    select distinct p_poll_id, p_member_id, chosen.id
    from unnest(p_date_ids) as chosen (id);
  end if;
end;
$$;

notify pgrst, 'reload schema';
