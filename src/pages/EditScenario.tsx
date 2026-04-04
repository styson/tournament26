import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearch, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

interface ArchivePlayings {
  totalGames: string;
  attacker_wins: string;
  defender_wins: string;
}

interface ArchiveResult {
  scenario_id: string;
  sc_id: string;
  title: string;
  attacker: string;
  defender: string;
  author: string;
  pub_name: string;
  playings: ArchivePlayings[];
}

export default function EditScenario() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const { q } = useSearch({ from: '/scenarios/$id/edit' });

  const [scenId,              setScenId]              = useState('');
  const [title,               setTitle]               = useState('');
  const [attackerNationality, setAttackerNationality] = useState('');
  const [defenderNationality, setDefenderNationality] = useState('');
  const [source,              setSource]              = useState('');
  const [archiveId,           setArchiveId]           = useState('');
  const [loading,             setLoading]             = useState(true);
  const [saving,              setSaving]              = useState(false);
  const [deleting,            setDeleting]            = useState(false);
  const [error,               setError]               = useState('');

  const [searching,    setSearching]    = useState(false);
  const [archiveData,  setArchiveData]  = useState<ArchiveResult | null>(null);
  const [archiveError, setArchiveError] = useState('');

  useEffect(() => {
    supabase.from('scenarios').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setError(error?.message ?? 'Not found'); }
        else {
          setScenId(data.scen_id ?? '');
          setTitle(data.title);
          setAttackerNationality(data.attacker_nationality);
          setDefenderNationality(data.defender_nationality);
          setSource(data.source ?? '');
          setArchiveId(data.archive_id ?? '');
        }
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const { error } = await supabase.from('scenarios').update({
      scen_id:              scenId.trim() || null,
      title:                title.trim(),
      attacker_nationality: attackerNationality.trim(),
      defender_nationality: defenderNationality.trim(),
      source:               source.trim() || null,
      archive_id:           archiveId.trim() || null,
    }).eq('id', id);

    setSaving(false);

    if (error) { setError(error.message); return; }
    navigate({ to: '/scenarios', search: { q } });
  }

  async function handleDelete(e: React.MouseEvent) {
    const { count } = await supabase
      .from('games')
      .select('id', { count: 'exact', head: true })
      .eq('scenario_id', id);

    if (count && count > 0) {
      setError(`Cannot delete — this scenario is used in ${count} game${count === 1 ? '' : 's'}.`);
      return;
    }

    if (!e.shiftKey && !confirm('Delete this scenario? This cannot be undone.')) return;
    setDeleting(true);
    const { error } = await supabase.from('scenarios').delete().eq('id', id);
    setDeleting(false);
    if (error) { setError(error.message); return; }
    navigate({ to: '/scenarios', search: { q } });
  }

  async function findScenarioDetails(e: React.MouseEvent) {
    e.preventDefault();
    if (!archiveId.trim()) return;

    setSearching(true);
    setArchiveError('');
    setArchiveData(null);

    try {
      const response = await fetch(
        `https://aslscenarioarchive.com/rest/scenario/list/${archiveId.trim()}`,
        { method: 'GET', mode: 'cors' }
      );
      const data: ArchiveResult = await response.json();

      if (data.scenario_id === archiveId.trim()) {
        setArchiveData(data);
      } else {
        setArchiveError('No matching scenario found in the archive.');
      }
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <div className="anim-0">
        <div className="section-label" style={{ marginBottom: '0.3rem' }}>Scenario Library</div>
        <h1 style={{ fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
          Edit Scenario
        </h1>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>

          {/* Edit form */}
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
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="input"
                  type="text"
                  value={archiveId}
                  onChange={e => setArchiveId(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={findScenarioDetails}
                  disabled={searching || !archiveId.trim()}
                  style={{ whiteSpace: 'nowrap', opacity: searching || !archiveId.trim() ? 0.5 : 1 }}
                >
                  {searching ? 'Searching...' : 'Lookup'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ whiteSpace: 'nowrap', opacity: !archiveData ? 0.5 : 1 }}
                  disabled={!archiveData}
                  onClick={() => {
                    if (!archiveData) return;
                    setTitle(archiveData.title);
                    setScenId(archiveData.sc_id);
                    setAttackerNationality(archiveData.attacker);
                    setDefenderNationality(archiveData.defender);
                    setSource(archiveData.pub_name);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || deleting}
                style={{ opacity: saving ? 0.6 : 1, cursor: saving ? 'wait' : 'pointer' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link to="/scenarios" search={{ q }} className="btn-secondary">Cancel</Link>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting || saving}
                style={{ marginLeft: 'auto', opacity: deleting ? 0.6 : 1, cursor: deleting ? 'wait' : 'pointer' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </form>

          {/* Archive results panel */}
          <div className="card anim-1" style={{ flex: 1, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="section-label">Scenario Archive Data</div>

              {searching && (
                <div className="row" style={{ gap: '0.75rem' }}>
                  <div className="spinner" /><span style={{ color: 'var(--color-muted)' }}>Searching archive...</span>
                </div>
              )}

              {archiveError && <div className="error-box">{archiveError}</div>}

              {archiveData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <div className="field-label">Title</div>
                    <div style={{ color: 'var(--color-text)', fontWeight: 500 }}>{archiveData.title}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <div className="field-label">Scenario ID</div>
                      <div style={{ color: 'var(--color-accent)', fontFamily: 'monospace' }}>{archiveData.sc_id}</div>
                    </div>
                    <div>
                      <div className="field-label">Archive ID</div>
                      <div style={{ color: 'var(--color-muted)' }}>{archiveData.scenario_id}</div>
                    </div>
                    <div>
                      <div className="field-label">Attacker</div>
                      <div style={{ color: 'var(--color-text)' }}>{archiveData.attacker}</div>
                    </div>
                    <div>
                      <div className="field-label">Defender</div>
                      <div style={{ color: 'var(--color-text)' }}>{archiveData.defender}</div>
                    </div>
                  </div>
                  {(() => {
                    const p = archiveData.playings?.[0];
                    return p ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <div className="field-label">Games Played</div>
                          <div style={{ color: 'var(--color-text)' }}>{p.totalGames}</div>
                        </div>
                        <div>
                          <div className="field-label">Balance (Att:Def)</div>
                          <div style={{ color: 'var(--color-text)' }}>{p.attacker_wins}:{p.defender_wins}</div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  {archiveData.author && (
                    <div>
                      <div className="field-label">Designer</div>
                      <div style={{ color: 'var(--color-muted)' }}>{archiveData.author}</div>
                    </div>
                  )}
                  {archiveData.pub_name && (
                    <div>
                      <div className="field-label">Publication</div>
                      <div style={{ color: 'var(--color-muted)' }}>{archiveData.pub_name}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

        </div>
      )}
    </div>
  );
}
