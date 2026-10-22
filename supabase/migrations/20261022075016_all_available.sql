-- Date polls can offer a 모두가능 choice. Choosing it is stored as choosing
-- every candidate date, so only the flag that shows the choice is needed.

alter table public.polls
  add column all_available boolean not null default false;

notify pgrst, 'reload schema';
