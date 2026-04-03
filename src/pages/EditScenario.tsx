import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

export default function EditScenario() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();

  const [scenId,              setScenId]              = useState('');
  const [title,               setTitle]               = useState('');
  const [attackerNationality, setAttackerNationality] = useState('');
  const [defenderNationality, setDefenderNationality] = useState('');
  const [source,              setSource]              = useState('');
  const [loading,             setLoading]             = useState(true);
  const [saving,              setSaving]              = useState(false);
  const [error,               setError]               = useState('');

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
    }).eq('id', id);

    setSaving(false);

    if (error) { setError(error.message); return; }
    navigate({ to: '/scenarios' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>

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
        <form onSubmit={handleSubmit} className="card anim-1" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

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

          {error && <div className="error-box">{error}</div>}

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ opacity: saving ? 0.6 : 1, cursor: saving ? 'wait' : 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/scenarios" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      )}
    </div>
  );
}
