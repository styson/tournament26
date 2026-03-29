-- ============================================================
-- Round Scenarios join table
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.round_scenarios (
  round_id    uuid references public.rounds on delete cascade not null,
  scenario_id uuid references public.scenarios on delete cascade not null,
  primary key (round_id, scenario_id)
);

alter table public.round_scenarios enable row level security;

create policy "authenticated_read_round_scenarios"
  on public.round_scenarios for select to authenticated using (true);

create policy "authenticated_write_round_scenarios"
  on public.round_scenarios for all to authenticated using (true) with check (true);
