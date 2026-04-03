import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/config/auth';

export default function NewPlayer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.from('players').insert({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      location: location.trim() || null,
      created_by: user?.id,
    });

    setLoading(false);

    if (error) {
      console.error('Insert failed:', error);
      setError(error.message);
      return;
    }

    navigate({ to: '/players' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>

      {/* Header */}
      <div className="anim-0">
        <div className="section-label" style={{ marginBottom: '0.3rem' }}>Players</div>
        <h1 style={{ fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
          Enlist Player
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card anim-1" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div>
          <label className="field-label">Full Name *</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. John Smith"
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
              placeholder="john@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input
              className="input"
              type="tel"
              placeholder="+1 555 000 0000"
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
            placeholder="e.g. Chicago, IL"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        {error && (
          <div className="error-box">{error}</div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer' }}
          >
            {loading ? 'Enlisting...' : '+ Enlist Player'}
          </button>
          <Link to="/players" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
