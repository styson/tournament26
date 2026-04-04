import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>

      <div className="anim-0">
        <div className="section-label" style={{ marginBottom: '0.3rem' }}>Scenario Library</div>
        <h1 style={{ fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
          Add Scenario
        </h1>
      </div>

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

        <div>
          <div>
            <label className="field-label">Scenario Archive Id</label>
            <input
              className="input"
              type="text"
              value={archiveId}
              onChange={e => setArchiveId(e.target.value)}
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
            {saving ? 'Adding...' : '+ Add Scenario'}
          </button>
          <Link to="/scenarios" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
