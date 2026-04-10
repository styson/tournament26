import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';
import { ArrowRight } from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
}

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setError(error.message);
        } else {
          setTournaments(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="anim-0 flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="section-label mb-[0.3rem]">Tournaments</div>
          <h1 className="text-[2.4rem] tracking-[0.06em] m-0">
            Tournaments
          </h1>
        </div>
        <Link to="/tournaments/new" className="btn-primary">+ New Tournament</Link>
      </div>

      {/* List */}
      <div className="anim-1">
        {loading ? (
          <div className="card row justify-center p-12">
            <div className="spinner" />
            <span className="section-label">Loading...</span>
          </div>
        ) : error ? (
          <div className="card error-box p-5">{error}</div>
        ) : tournaments.length === 0 ? (
          <div className="card empty-state">
            <h3 className="text-[1.4rem] tracking-[0.06em] text-muted m-0">No Tournaments Active</h3>
            <p className="serif-body m-0">Launch your first tournament to get boots on the ground</p>
            <Link to="/tournaments/new" className="btn-primary mt-2">+ Launch First Tournament</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-px bg-border">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-surface py-5 px-6 flex justify-between items-start gap-4 transition-colors duration-150 hover:bg-raised"
              >
                <div>
                  <h3 className="text-[1.3rem] tracking-[0.06em] mt-0 mb-[0.4rem]">{tournament.name}</h3>
                  {tournament.description && (
                    <p className="text-muted mt-0 mb-2">{tournament.description}</p>
                  )}
                  <div className="flex gap-6 tracking-widest text-muted">
                    <span>{tournament.start_date}</span>
                    {tournament.end_date && <span>→ {tournament.end_date}</span>}
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <span
                    className="tracking-[0.12em] uppercase text-[0.7rem] whitespace-nowrap px-[0.4rem] py-[0.28rem] border"
                    style={{ color: statusColor(tournament.status), borderColor: statusColor(tournament.status) }}
                  >
                    {tournament.status}
                  </span>
                  <div className="flex flex-col gap-[0.4rem] items-stretch">
                    <Link
                      to="/tournaments/$id"
                      params={{ id: tournament.id }}
                      className="btn-sm no-underline inline-flex items-center gap-[0.35rem] justify-center"
                    >
                      View <ArrowRight size={14} />
                    </Link>
                    <Link
                      to="/tournaments/$id/edit"
                      params={{ id: tournament.id }}
                      className="btn-sm no-underline text-center"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE':    return 'var(--color-green-dim)';
    case 'COMPLETED': return 'var(--color-muted)';
    case 'CANCELLED': return 'var(--color-red)';
    default:          return 'var(--color-accent)'; // DRAFT
  }
}
