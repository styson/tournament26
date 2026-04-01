import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

export default function EditTournament() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  useEffect(() => {
    supabase.from('tournaments').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setError(error?.message ?? 'Not found'); }
        else {
          setName(data.name);
          setDescription(data.description ?? '');
          setStartDate(data.start_date);
          setEndDate(data.end_date ?? '');
        }
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const { error } = await supabase.from('tournaments').update({
      name:        name.trim(),
      description: description.trim() || null,
      start_date:  startDate,
      end_date:    endDate || null,
    }).eq('id', id);

    setSaving(false);

    if (error) { setError(error.message); return; }
    navigate({ to: '/tournaments' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>

      <div className="anim-0">
        <div className="section-label" style={{ marginBottom: '0.3rem' }}>Tournaments</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
          Edit Tournament
        </h1>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card anim-1" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <label className="field-label">Tournament Name *</label>
            <input
              className="input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', fontFamily: '"IBM Plex Mono", monospace', fontSize: '1rem', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="field-label">Start Date *</label>
              <input
                className="input"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="field-label">End Date</label>
              <input
                className="input"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
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
            <Link to="/tournaments" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      )}
    </div>
  );
}
