import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

const PAGE_SIZE = 20;

interface Player {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
}

function buildQuery(search: string, page: number) {
  const term = search.trim();
  let q = supabase
    .from('players')
    .select('id, name, email, phone, location')
    .order('name')
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (term) {
    q = q.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,location.ilike.%${term}%`
    );
  }

  return q;
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { q } = useSearch({ from: '/players' });
  const search = q ?? '';

  function setSearch(value: string) {
    navigate({ to: '/players', search: { q: value }, replace: true });
  }

  const pageRef = useRef(0);
  const searchRef = useRef('');
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const term = search;
    searchRef.current = term; // sync immediately so the observer sees it right away
    const timer = setTimeout(async () => {
      pageRef.current = 0;
      setLoading(true);
      setError('');

      const { data, error } = await buildQuery(term, 0);

      if (searchRef.current !== term) return;
      if (error) { setError(error.message); setLoading(false); return; }

      const rows = data ?? [];
      const more = rows.length === PAGE_SIZE;
      setPlayers(rows);
      setHasMore(more);
      hasMoreRef.current = more;
      setLoading(false);
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search]);

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;

    observerRef.current = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      if (!hasMoreRef.current) return;
      if (loadingMoreRef.current) return;

      loadingMoreRef.current = true;
      setLoadingMore(true);

      const nextPage = pageRef.current + 1;
      const { data, error } = await buildQuery(searchRef.current, nextPage);

      if (error) { setError(error.message); }
      else {
        const rows = data ?? [];
        if (rows.length > 0) {
          setPlayers(prev => [...prev, ...rows]);
          pageRef.current = nextPage;
        }
        const more = rows.length === PAGE_SIZE;
        setHasMore(more);
        hasMoreRef.current = more;
      }

      loadingMoreRef.current = false;
      setLoadingMore(false);
    }, { rootMargin: '300px' });

    observerRef.current.observe(node);
  }, []);

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="anim-0 flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="section-label mb-[0.3rem]">Personnel Records</div>
          <h1 className="text-[2.4rem] tracking-[0.06em] m-0">
            Players
            {!loading && (
              <span className="mono text-[0.85rem] text-accent ml-3 tracking-widest">
                {players.length}{hasMore ? '+' : ''}
              </span>
            )}
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-55"
          />
          <Link to="/players/new" className="btn-primary">+ Enlist Player</Link>
        </div>
      </div>

      <div className="card anim-1 p-0 overflow-hidden">
        {loading ? (
          <div className="row justify-center p-12">
            <div className="spinner" /><span className="section-label">Loading...</span>
          </div>
        ) : error ? (
          <div className="error-box">{error}</div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
            <h3 className="text-[1.4rem] tracking-[0.06em] text-muted m-0">
              {search ? 'No Matches Found' : 'No Personnel on Record'}
            </h3>
            <p className="text-[0.95rem] text-muted-dim m-0 text-center">
              {search ? 'Try a different search term' : 'Enlist your first player to begin building the roster'}
            </p>
            {!search && <Link to="/players/new" className="btn-primary mt-2">+ Enlist First Player</Link>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {players.map(p => (
                  <tr key={p.id}>
                    <td className="text-text font-medium">{p.name}</td>
                    <td>{p.email ?? '—'}</td>
                    <td>{p.phone ?? '—'}</td>
                    <td>{p.location ?? '—'}</td>
                    <td>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => navigate({ to: '/players/$id/edit', params: { id: p.id }, search: { q: search } })}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div ref={sentinelRef} className="h-px" />
            {loadingMore && (
              <div className="row justify-center p-4">
                <div className="spinner" /><span className="section-label">Loading...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
