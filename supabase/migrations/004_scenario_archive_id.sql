-- Add archive_id (MMP archive reference ID) to scenarios
alter table public.scenarios
  add column if not exists archive_id text;
