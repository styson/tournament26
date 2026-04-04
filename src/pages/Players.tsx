import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
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
    .order('name');

  if (term) {
    q = q.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,location.ilike.%${term}%`
    ).limit(PAGE_SIZE);
  } else {
    q = q.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  }

  return q;
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const pageRef = useRef(0);
  const searchRef = useRef('');
  const loadingMoreRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const term = search;
    const timer = setTimeout(async () => {
      searchRef.current = term;
      pageRef.current = 0;
      setLoading(true);
      setError('');

      const { data, error } = await buildQuery(term, 0);

      if (searchRef.current !== term) return;
      if (error) { setError(error.message); setLoading(false); return; }

      const rows = data ?? [];
      setPlayers(rows);
      setHasMore(!term.trim() && rows.length === PAGE_SIZE);
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
      if (searchRef.current.trim()) return;
      if (loadingMoreRef.current) return;

      loadingMoreRef.current = true;
      setLoadingMore(true);

      const nextPage = pageRef.current + 1;
      const { data, error } = await buildQuery('', nextPage);

      if (error) { setError(error.message); }
      else {
        const rows = data ?? [];
        if (rows.length > 0) {
          setPlayers(prev => [...prev, ...rows]);
          pageRef.current = nextPage;
        }
        setHasMore(rows.length === PAGE_SIZE);
      }

      loadingMoreRef.current = false;
      setLoadingMore(false);
    }, { rootMargin: '300px' });

    observerRef.current.observe(node);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.3rem' }}>Personnel Records</div>
          <h1 style={{ fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Players
            {!loading && (
              <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--color-accent)', marginLeft: '0.75rem', letterSpacing: '0.1em' }}>
                {players.length}{hasMore ? '+' : ''}
              </span>
            )}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ width: '220px' }}
          />
          <Link to="/players/new" className="btn-primary">+ Enlist Player</Link>
        </div>
      </div>

      <div className="card anim-1" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="row" style={{ justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" /><span className="section-label">Loading...</span>
          </div>
        ) : error ? (
          <div className="error-box">{error}</div>
        ) : players.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.4rem', letterSpacing: '0.06em', color: 'var(--color-muted)', margin: 0 }}>
              {search ? 'No Matches Found' : 'No Personnel on Record'}
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-muted-dim)', margin: 0, textAlign: 'center' }}>
              {search ? 'Try a different search term' : 'Enlist your first player to begin building the roster'}
            </p>
            {!search && <Link to="/players/new" className="btn-primary" style={{ marginTop: '0.5rem' }}>+ Enlist First Player</Link>}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
                    <td style={{ color: 'var(--color-text)', fontWeight: 500 }}>{p.name}</td>
                    <td>{p.email ?? '—'}</td>
                    <td>{p.phone ?? '—'}</td>
                    <td>{p.location ?? '—'}</td>
                    <td>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => navigate({ to: '/players/$id/edit', params: { id: p.id } })}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div ref={sentinelRef} style={{ height: 1 }} />
            {loadingMore && (
              <div className="row" style={{ justifyContent: 'center', padding: '1rem' }}>
                <div className="spinner" /><span className="section-label">Loading...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
