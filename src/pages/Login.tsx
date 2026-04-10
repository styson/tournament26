import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/config/auth';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: '/dashboard' });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message ?? 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dot-grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,var(--color-raised)_1px,transparent_1px)] bg-size-[22px_22px] opacity-80 pointer-events-none" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--color-bg)_100%)] pointer-events-none" />

      <div className="relative z-1 w-full max-w-95">

        {/* Header */}
        <div className="anim-0 text-center mb-8">
          {/* Badge */}
          <div className="inline-flex items-center justify-center w-13 h-13 bg-accent [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))] mb-4">
            <span className="font-display text-2xl text-bg tracking-[0.05em]">T</span>
          </div>
          <h1 className="text-[2.2rem] tracking-widest text-text m-0">
            TOURNEY<span className="text-accent">26</span>
          </h1>
          <p className="text-[0.6rem] tracking-[0.2em] text-muted uppercase mt-[0.4rem]">
            Secure Access Required
          </p>
        </div>

        {/* Card */}
        <div className="card anim-1 p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="field-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="commander@unit.mil"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="error-box">{error}</div>
            )}

            <button
              type="submit"
              className={`btn-primary w-full justify-center ${loading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Enter HQ'}
            </button>
          </form>
        </div>

        <p className="text-center text-[0.58rem] text-muted-dim tracking-[0.12em] mt-5 uppercase">
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
