-- ============================================================
-- Tournament26 — Core Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- tournaments
create table if not exists public.tournaments (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  description  text,
  start_date   date not null,
  end_date     date,
  status       text not null default 'DRAFT'
                 check (status in ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_by   uuid references auth.users on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- players
create table if not exists public.players (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  email        text,
  phone        text,
  location     text,
  created_by   uuid references auth.users on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- tournament_players (enrollment)
create table if not exists public.tournament_players (
  tournament_id uuid references public.tournaments on delete cascade not null,
  player_id     uuid references public.players on delete cascade not null,
  enrolled_at   timestamptz default now(),
  primary key (tournament_id, player_id)
);

-- rounds
create table if not exists public.rounds (
  id             uuid default gen_random_uuid() primary key,
  tournament_id  uuid references public.tournaments on delete cascade not null,
  round_number   int not null,
  name           text,
  status         text not null default 'PENDING'
                   check (status in ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- scenarios
create table if not exists public.scenarios (
  id                    uuid default gen_random_uuid() primary key,
  title                 text not null,
  description           text,
  attacker_nationality  text not null,
  defender_nationality  text not null,
  source                text,
  created_at            timestamptz default now()
);

-- games
create table if not exists public.games (
  id           uuid default gen_random_uuid() primary key,
  tournament_id uuid references public.tournaments on delete cascade not null,
  round_id     uuid references public.rounds on delete cascade,
  scenario_id  uuid references public.scenarios on delete set null,
  attacker_id  uuid references public.players on delete set null,
  defender_id  uuid references public.players on delete set null,
  winner_id    uuid references public.players on delete set null,
  result       text check (result in ('ATTACKER_WIN', 'DEFENDER_WIN', 'DRAW')),
  status       text not null default 'SCHEDULED'
                 check (status in ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  notes        text,
  played_at    timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- Row-Level Security
-- ============================================================

alter table public.tournaments       enable row level security;
alter table public.players           enable row level security;
alter table public.tournament_players enable row level security;
alter table public.rounds            enable row level security;
alter table public.scenarios         enable row level security;
alter table public.games             enable row level security;

-- Authenticated users can read all data
create policy "authenticated_read_tournaments"  on public.tournaments       for select to authenticated using (true);
create policy "authenticated_read_players"      on public.players           for select to authenticated using (true);
create policy "authenticated_read_tp"           on public.tournament_players for select to authenticated using (true);
create policy "authenticated_read_rounds"       on public.rounds            for select to authenticated using (true);
create policy "authenticated_read_scenarios"    on public.scenarios         for select to authenticated using (true);
create policy "authenticated_read_games"        on public.games             for select to authenticated using (true);

-- Authenticated users can insert/update/delete (TD controls everything)
create policy "authenticated_write_tournaments" on public.tournaments       for all to authenticated using (true) with check (true);
create policy "authenticated_write_players"     on public.players           for all to authenticated using (true) with check (true);
create policy "authenticated_write_tp"          on public.tournament_players for all to authenticated using (true) with check (true);
create policy "authenticated_write_rounds"      on public.rounds            for all to authenticated using (true) with check (true);
create policy "authenticated_write_scenarios"   on public.scenarios         for all to authenticated using (true) with check (true);
create policy "authenticated_write_games"       on public.games             for all to authenticated using (true) with check (true);

-- ============================================================
-- updated_at trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_tournaments_updated_at before update on public.tournaments
  for each row execute procedure public.set_updated_at();
create trigger set_players_updated_at before update on public.players
  for each row execute procedure public.set_updated_at();
create trigger set_rounds_updated_at before update on public.rounds
  for each row execute procedure public.set_updated_at();
create trigger set_games_updated_at before update on public.games
  for each row execute procedure public.set_updated_at();
