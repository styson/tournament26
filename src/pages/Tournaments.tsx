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
          <div className="section-label mb-1">Tournaments</div>
          <h1 className="text-4xl tracking-wider m-0">
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
            <h3 className="text-2xl tracking-wider text-muted m-0">No Tournaments Active</h3>
            <p className="serif-body m-0">Launch your first tournament to get boots on the ground</p>
            <Link to="/tournaments/new" className="btn-primary mt-2">+ Launch First Tournament</Link>
          </div>
        ) : (
          <TournamentList tournaments={tournaments} />
        )}
      </div>
    </div>
  );
}

function TournamentRow({ tournament }: { tournament: Tournament }) {
  return (
    <div className="bg-surface py-5 px-6 flex justify-between items-start gap-4 transition-colors duration-150 hover:bg-raised">
      <div>
        <h3 className="text-2xl tracking-wider mt-0 mb-1.5">{tournament.name}</h3>
        {tournament.description && (
          <p className="text-muted mt-0 mb-2">{tournament.description}</p>
        )}
        <div className="flex gap-6 tracking-widest text-muted">
          <span>{tournament.start_date}</span>
          {tournament.end_date && <span>→ {tournament.end_date}</span>}
        </div>
      </div>
      <div className="flex gap-2 items-start">
        <span className={`status-badge text-sm whitespace-nowrap ${tournamentStatusClass(tournament.status)}`}>
          {tournament.status}
        </span>
        <div className="flex flex-col gap-2 items-stretch">
          <Link
            to="/tournaments/$id"
            params={{ id: tournament.id }}
            className="btn-sm no-underline inline-flex items-center gap-1 justify-center"
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
  );
}

function TournamentList({ tournaments }: { tournaments: Tournament[] }) {
  const active = tournaments.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const completed = tournaments.filter(t => t.status === 'COMPLETED' || t.status === 'CANCELLED');

  return (
    <div className="flex flex-col gap-5">
      {active.length > 0 && (
        <div className="flex flex-col gap-px bg-border">
          {active.map(t => <TournamentRow key={t.id} tournament={t} />)}
        </div>
      )}
      {completed.length > 0 && (
        <>
          <div className="section-label mt-2">Completed</div>
          <div className="flex flex-col gap-px bg-border">
            {completed.map(t => <TournamentRow key={t.id} tournament={t} />)}
          </div>
        </>
      )}
    </div>
  );
}

function tournamentStatusClass(status: string) {
  switch (status) {
    case 'ACTIVE':      return 'status-active';
    case 'COMPLETED':   return 'status-completed';
    case 'CANCELLED':   return 'status-cancelled';
    case 'IN_PROGRESS': return 'status-in-progress';
    default:            return 'status-draft';
  }
}
