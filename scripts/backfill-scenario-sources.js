#!/usr/bin/env node
/**
 * Backfill scenario source data from aslscenarioarchive.com.
 *
 * Fetches up to 100 scenarios that have an archive_id but no source,
 * looks each one up on the archive, and updates the DB record with:
 *   scen_id, title, attacker_nationality, defender_nationality, source
 *
 * Usage:
 *   node scripts/backfill-scenario-sources.js           # live run
 *   node scripts/backfill-scenario-sources.js --dry-run # preview only, no DB writes
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env.local
 * (or environment variables if already set).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── load .env.local ──────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local not found — fall through to use environment variables
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

if (!process.env.VITE_SUPABASE_SERVICE_KEY) {
  console.warn('Warning: VITE_SUPABASE_SERVICE_KEY not set — falling back to anon key (RLS will apply)\n');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── fetch from archive ───────────────────────────────────────────────────────

async function fetchArchive(archiveId) {
  const url = `https://aslscenarioarchive.com/rest/scenario/list/${archiveId}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for archive_id ${archiveId}`);
  const data = await res.json();
  // The API returns the queried id in scenario_id when found
  if (String(data.scenario_id) !== String(archiveId)) return null;
  return data;
}

// ── main ─────────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');
const batchArg = process.argv.find((a) => a.startsWith('--batch=') || a.startsWith('-b='));
const BATCH_SIZE = batchArg ? parseInt(batchArg.split('=')[1], 10) : 10;
const DELAY_MS = 200; // polite delay between archive requests

if (DRY_RUN) console.log('DRY RUN — no database writes will be made.\n');

const { data: scenarios, error: fetchError } = await supabase
  .from('scenarios')
  .select('id, archive_id, title')
  .not('archive_id', 'is', null)
  .or('source.is.null,source.eq.')
  .limit(BATCH_SIZE);

if (fetchError) {
  console.error('Failed to fetch scenarios:', fetchError.message);
  process.exit(1);
}

if (!scenarios || scenarios.length === 0) {
  console.log('No scenarios need backfilling.');
  process.exit(0);
}

console.log(`Found ${scenarios.length} scenario(s) to backfill.\n`);

let updated = 0;
let skipped = 0;
let failed = 0;

for (const scenario of scenarios) {
  const { id, archive_id, title } = scenario;
  process.stdout.write(`  [${archive_id}] "${title}" ... `);

  let archiveData;
  try {
    archiveData = await fetchArchive(archive_id);
  } catch (err) {
    console.log(`FETCH ERROR: ${err.message}`);
    failed++;
    continue;
  }

  if (!archiveData) {
    console.log('not found in archive — skipped');
    skipped++;
    continue;
  }

  const label = `${archiveData.sc_id} — ${archiveData.pub_name}`;

  if (DRY_RUN) {
    console.log(`would update (${label})`);
    updated++;
    continue;
  }

  const payload = {
    scen_id:              archiveData.sc_id ?? null,
    title:                archiveData.title,
    attacker_nationality: archiveData.attacker,
    defender_nationality: archiveData.defender,
    source:               archiveData.pub_name ?? 'n/a',
  };

  let { error: updateError } = await supabase.from('scenarios').update(payload).eq('id', id);

  if (updateError?.code === '23505') {
    // Duplicate scen_id — delete the conflicting row and retry
    const { data: dup } = await supabase
      .from('scenarios')
      .select('id, title')
      .eq('scen_id', archiveData.sc_id)
      .neq('id', id)
      .single();

    if (dup) {
      const { error: delError } = await supabase.from('scenarios').delete().eq('id', dup.id);
      if (delError) {
        console.log(`DELETE ERROR (duplicate "${dup.title}"): ${delError.message}`);
        failed++;
        continue;
      }
      console.log(`\n    deleted duplicate "${dup.title}" (${dup.id})`);
      process.stdout.write(`    retrying ... `);
      ({ error: updateError } = await supabase.from('scenarios').update(payload).eq('id', id));
    }
  }

  if (updateError) {
    console.log(`UPDATE ERROR: ${updateError.message}`);
    failed++;
  } else {
    console.log(`updated (${label})`);
    updated++;
  }

  await new Promise((r) => setTimeout(r, DELAY_MS));
}

const action = DRY_RUN ? 'Would update' : 'Updated';
console.log(`\nDone. ${action}: ${updated}  Skipped: ${skipped}  Failed: ${failed}`);

const { count } = await supabase
  .from('scenarios')
  .select('id', { count: 'exact', head: true })
  .not('archive_id', 'is', null)
  .or('source.is.null,source.eq.');

console.log(`Remaining: ${count ?? '?'} scenario(s) still need backfilling.`);
