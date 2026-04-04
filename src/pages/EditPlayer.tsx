import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearch, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

export default function EditPlayer() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const { q } = useSearch({ from: '/players/$id/edit' });

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [location, setLocation] = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    supabase.from('players').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setError(error?.message ?? 'Not found'); }
        else {
          setName(data.name);
          setEmail(data.email ?? '');
          setPhone(data.phone ?? '');
          setLocation(data.location ?? '');
        }
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const { error } = await supabase.from('players').update({
      name:     name.trim(),
      email:    email.trim() || null,
      phone:    phone.trim() || null,
      location: location.trim() || null,
    }).eq('id', id);

    setSaving(false);

    if (error) { setError(error.message); return; }
    navigate({ to: '/players', search: { q } });
  }

  async function handleDelete(e: React.MouseEvent) {
    const [{ count: gameCount }, { count: tourneyCount }] = await Promise.all([
      supabase
        .from('games')
        .select('id', { count: 'exact', head: true })
        .or(`attacker_id.eq.${id},defender_id.eq.${id},winner_id.eq.${id}`),
      supabase
        .from('tournament_players')
        .select('player_id', { count: 'exact', head: true })
        .eq('player_id', id),
    ]);

    const reasons: string[] = [];
    if (gameCount && gameCount > 0)
      reasons.push(`${gameCount} game${gameCount === 1 ? '' : 's'}`);
    if (tourneyCount && tourneyCount > 0)
      reasons.push(`${tourneyCount} tournament${tourneyCount === 1 ? '' : 's'}`);

    if (reasons.length > 0) {
      setError(`Cannot delete — this player appears in ${reasons.join(' and ')}.`);
      return;
    }

    if (!e.shiftKey && !confirm('Delete this player? This cannot be undone.')) return;
    setDeleting(true);
    const { error } = await supabase.from('players').delete().eq('id', id);
    setDeleting(false);
    if (error) { setError(error.message); return; }
    navigate({ to: '/players', search: { q } });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>

      <div className="anim-0">
        <div className="section-label" style={{ marginBottom: '0.3rem' }}>Players</div>
        <h1 style={{ fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
          Edit Player
        </h1>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card anim-1" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <label className="field-label">Full Name *</label>
            <input
              className="input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="field-label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="input"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Location</label>
            <input
              className="input"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
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
            <Link to="/players" search={{ q }} className="btn-secondary">Cancel</Link>
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
      )}
    </div>
  );
}
