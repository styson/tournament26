import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/config/auth';

export default function NewTournament() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.from('tournaments').insert({
      name: name.trim(),
      description: description.trim() || null,
      start_date: startDate,
      end_date: endDate || null,
      status: 'DRAFT',
      created_by: user?.id,
    });

    setLoading(false);

    if (error) {
      console.error('Insert failed:', error);
      setError(error.message);
      return;
    }

    navigate({ to: '/tournaments' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>

      {/* Header */}
      <div className="anim-0">
        <div className="section-label" style={{ marginBottom: '0.3rem' }}>Tournaments</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
          New Tournament
        </h1>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} className="card anim-1" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Name */}
        <div>
          <label className="field-label">Tournament Name *</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. Spring Invitational 2026"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="field-label">Description</label>
          <textarea
            className="input"
            placeholder="Optional notes about this tournament..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ resize: 'vertical', fontFamily: '"IBM Plex Mono", monospace', fontSize: '1rem', lineHeight: 1.6 }}
          />
        </div>

        {/* Dates */}
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

        {/* Error */}
        {error && (
          <div className="error-box">{error}</div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer' }}
          >
            {loading ? 'Creating...' : '+ Create Tournament'}
          </button>
          <Link to="/tournaments" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
