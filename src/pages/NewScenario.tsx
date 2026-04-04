import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';
import { toTitleCase } from '@/utils/format';

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
    navigate({ to: '/scenarios' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <div className="anim-0">
        <div className="section-label" style={{ marginBottom: '0.3rem' }}>Scenario Library</div>
        <h1 style={{ fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
          Add Scenario
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>

        <form onSubmit={handleSubmit} className="card anim-1" style={{ flex: 1, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ opacity: saving ? 0.6 : 1, cursor: saving ? 'wait' : 'pointer' }}
            >
              {saving ? 'Adding...' : '+ Add Scenario'}
            </button>
            <Link to="/scenarios" className="btn-secondary">Cancel</Link>
          </div>
        </form>

        {/* Title match panel */}
        <div className="card anim-1" style={{ flex: 1, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="section-label">Existing Matches</div>

          {matchLoading && (
            <div className="row" style={{ gap: '0.75rem' }}>
              <div className="spinner" /><span style={{ color: 'var(--color-muted)' }}>Searching...</span>
            </div>
          )}

          {!matchLoading && title.trim() && matches.length === 0 && (
            <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}>No existing matches found.</p>
          )}

          {!matchLoading && !title.trim() && (
            <p style={{ color: 'var(--color-muted-dim)', margin: 0, fontSize: '0.9rem' }}>Type a title to search existing scenarios.</p>
          )}

          {matches.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {matches.map(s => (
                <div key={s.id} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{s.title}</span>
                    <Link to="/scenarios/$id/edit" params={{ id: s.id }} className="btn-secondary btn-sm">Edit</Link>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-muted)' }}>ID</span>
                    <span style={{ color: 'var(--color-accent)', fontFamily: 'monospace' }}>{s.scen_id ?? '—'}</span>
                    <span style={{ color: 'var(--color-muted)' }}>Archive</span>
                    <span style={{ color: 'var(--color-muted)' }}>{s.archive_id ?? '—'}</span>
                    <span style={{ color: 'var(--color-muted)' }}>Attacker</span>
                    <span style={{ color: 'var(--color-text)' }}>{toTitleCase(s.attacker_nationality)}</span>
                    <span style={{ color: 'var(--color-muted)' }}>Defender</span>
                    <span style={{ color: 'var(--color-text)' }}>{toTitleCase(s.defender_nationality)}</span>
                    {s.source && <>
                      <span style={{ color: 'var(--color-muted)' }}>Source</span>
                      <span style={{ color: 'var(--color-muted)' }}>{s.source}</span>
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
