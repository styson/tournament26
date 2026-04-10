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
    <div className="flex flex-col gap-5 max-w-150">

      {/* Header */}
      <div className="anim-0">
        <div className="section-label mb-[0.3rem]">Tournaments</div>
        <h1 className="text-[2.4rem] tracking-[0.06em] m-0">
          New Tournament
        </h1>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} className="card anim-1 p-7 flex flex-col gap-5">

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
            className="input resize-y text-base leading-[1.6]"
            placeholder="Optional notes about this tournament..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Start Date *</label>
            <input
              className="input scheme-dark"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">End Date</label>
            <input
              className="input scheme-dark"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-box">{error}</div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            className={`btn-primary ${loading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
            disabled={loading}
          >
            {loading ? 'Creating...' : '+ Create Tournament'}
          </button>
          <Link to="/tournaments" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
