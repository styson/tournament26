-- Add scen_id (human-readable scenario identifier, e.g. "ASL 1", "BFP 150") to scenarios
alter table public.scenarios
  add column if not exists scen_id text;
