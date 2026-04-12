import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

interface MatchedScenario {
  id: string;
  scen_id: string | null;
  title: string;
  attacker_nationality: string;
  defender_nationality: string;
  source: string | null;
  archive_id: string | null;
}

export default function NewScenario() {
  const navigate = useNavigate();

  const [scenId,              setScenId]              = useState('');
  const [title,               setTitle]               = useState('');
  const [attackerNationality, setAttackerNationality] = useState('');
  const [defenderNationality, setDefenderNationality] = useState('');
  const [source,              setSource]              = useState('');
  const [archiveId,           setArchiveId]           = useState('');
  const [saving,              setSaving]              = useState(false);
  const [error,               setError]               = useState('');

  const [matches,        setMatches]        = useState<MatchedScenario[]>([]);
  const [matchLoading,   setMatchLoading]   = useState(false);
  const titleRef = useRef('');

  useEffect(() => {
    const term = title.trim();
    titleRef.current = term;

    if (!term) { setMatches([]); return; }

    const timer = setTimeout(async () => {
      if (titleRef.current !== term) return;
      setMatchLoading(true);

      const { data } = await supabase
        .from('scenarios')
        .select('id, scen_id, title, attacker_nationality, defender_nationality, source, archive_id')
        .ilike('title', `%${term}%`)
        .order('title')
        .limit(10);

      if (titleRef.current !== term) return;
      setMatches(data ?? []);
      setMatchLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const { error } = await supabase.from('scenarios').insert({
      scen_id:              scenId.trim() || null,
      title:                title.trim(),
      attacker_nationality: attackerNationality.trim(),
      defender_nationality: defenderNationality.trim(),
      source:               source.trim() || null,
      archive_id:           archiveId.trim() || null,
    });

    setSaving(false);

    if (error) { setError(error.message); return; }
    navigate({ to: '/scenarios', search: { q: '' } });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="anim-0">
        <div className="section-label mb-1">Scenario Library</div>
        <h1 className="text-4xl tracking-wider m-0">
          Add Scenario
        </h1>
      </div>

      <div className="flex gap-5 items-start">

        <form onSubmit={handleSubmit} className="card anim-1 flex-1 p-7 flex flex-col gap-5">

          <div className="grid grid-cols-[1fr_2fr] gap-4">
            <div>
              <label className="field-label">Scenario ID *</label>
              <input
                className="input"
                type="text"
                value={scenId}
                onChange={e => setScenId(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="field-label">Source</label>
              <input
                className="input"
                type="text"
                value={source}
                onChange={e => setSource(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Title *</label>
            <input
              className="input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Attacker Nationality</label>
              <input
                className="input"
                type="text"
                value={attackerNationality}
                onChange={e => setAttackerNationality(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Defender Nationality</label>
              <input
                className="input"
                type="text"
                value={defenderNationality}
                onChange={e => setDefenderNationality(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Scenario Archive ID</label>
            <input
              className="input"
              type="text"
              value={archiveId}
              onChange={e => setArchiveId(e.target.value)}
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className={`btn-primary ${saving ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              disabled={saving}
            >
              {saving ? 'Adding...' : '+ Add Scenario'}
            </button>
            <Link to="/scenarios" search={{ q: '' }} className="btn-secondary">Cancel</Link>
          </div>
        </form>

        {/* Title match panel */}
        <div className="card anim-1 flex-1 p-7 flex flex-col gap-4">
          <div className="section-label">Existing Matches</div>

          {matchLoading && (
            <div className="row gap-3">
              <div className="spinner" /><span className="text-muted">Searching...</span>
            </div>
          )}

          {!matchLoading && title.trim() && matches.length === 0 && (
            <p className="text-muted m-0 text-sm">No existing matches found.</p>
          )}

          {!matchLoading && !title.trim() && (
            <p className="text-muted-dim m-0 text-sm">Type a title to search existing scenarios.</p>
          )}

          {matches.length > 0 && (
            <div className="flex flex-col gap-3">
              {matches.map(s => (
                <div key={s.id} className="border-t border-border pt-3">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="font-medium text-text">{s.title}</span>
                    <Link to="/scenarios/$id/edit" params={{ id: s.id }} search={{ q: '' }} className="btn-secondary btn-sm">Edit</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm">
                    <span className="text-muted">ID</span>
                    <span className="text-accent font-mono">{s.scen_id ?? '—'}</span>
                    <span className="text-muted">Archive</span>
                    <span className="text-muted">{s.archive_id ?? '—'}</span>
                    <span className="text-muted">Attacker</span>
                    <span className="text-text">{s.attacker_nationality}</span>
                    <span className="text-muted">Defender</span>
                    <span className="text-text">{s.defender_nationality}</span>
                    {s.source && <>
                      <span className="text-muted">Source</span>
                      <span className="text-muted">{s.source}</span>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
