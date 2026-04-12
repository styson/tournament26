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
    <div className="flex flex-col gap-5 max-w-150">

      <div className="anim-0">
        <div className="section-label mb-1">Tournaments</div>
        <h1 className="text-4xl tracking-wider m-0">
          Edit Tournament
        </h1>
      </div>

      {loading ? (
        <div className="card p-12 flex justify-center">
          <div className="spinner" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card anim-1 p-7 flex flex-col gap-5">

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
              className="input resize-y text-base leading-[1.6]"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

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

          {error && <div className="error-box">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className={`btn-primary ${saving ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              disabled={saving}
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
