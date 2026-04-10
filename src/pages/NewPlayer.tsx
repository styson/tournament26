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
    <div className="flex flex-col gap-5 max-w-150">

      {/* Header */}
      <div className="anim-0">
        <div className="section-label mb-[0.3rem]">Players</div>
        <h1 className="text-[2.4rem] tracking-[0.06em] m-0">
          Enlist Player
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card anim-1 p-7 flex flex-col gap-5">

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

        <div className="grid grid-cols-2 gap-4">
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

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            className={`btn-primary ${loading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
            disabled={loading}
          >
            {loading ? 'Enlisting...' : '+ Enlist Player'}
          </button>
          <Link to="/players" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
