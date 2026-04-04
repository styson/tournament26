import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';
import { toTitleCase } from '@/utils/format';

const PAGE_SIZE = 20;

interface Scenario {
  id: string;
  scen_id: string | null;
  title: string;
  attacker_nationality: string;
  defender_nationality: string;
  source: string | null;
  archive_id: string | null;
}

function buildQuery(search: string, page: number) {
  const term = search.trim();
  let q = supabase
    .from('scenarios')
    .select('id, scen_id, title, attacker_nationality, defender_nationality, source, archive_id')
    .order('title');

  if (term) {
    q = q.or(
      `title.ilike.%${term}%,scen_id.ilike.%${term}%,source.ilike.%${term}%,` +
      `attacker_nationality.ilike.%${term}%,defender_nationality.ilike.%${term}%`
    ).limit(PAGE_SIZE);
  } else {
    q = q.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  }

  return q;
}

export default function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
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

  // Load first page whenever search changes (debounced)
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
      setScenarios(rows);
      setHasMore(!term.trim() && rows.length === PAGE_SIZE);
      setLoading(false);
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search]);

  // Callback ref — wires up the observer as soon as the sentinel mounts
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
          setScenarios(prev => [...prev, ...rows]);
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
          <div className="section-label" style={{ marginBottom: '0.3rem' }}>Scenario Library</div>
          <h1 style={{ fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Scenarios
            {!loading && (
              <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--color-accent)', marginLeft: '0.75rem', letterSpacing: '0.1em' }}>
                {scenarios.length}{hasMore ? '+' : ''}
              </span>
            )}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search scenarios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ width: '220px' }}
          />
          <Link to="/scenarios/new" className="btn-primary">+ Add Scenario</Link>
        </div>
      </div>

      <div className="card anim-1" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="row" style={{ justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" /><span className="section-label">Loading...</span>
          </div>
        ) : error ? (
          <div className="error-box">{error}</div>
        ) : scenarios.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.4rem', letterSpacing: '0.06em', color: 'var(--color-muted)', margin: 0 }}>
              {search ? 'No Matches Found' : 'No Scenarios Loaded'}
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-muted-dim)', margin: 0, textAlign: 'center' }}>
              {search ? 'Try a different search term' : 'Import scenarios via the SQL migration'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Title</th>
                  <th>Attacker</th>
                  <th>Defender</th>
                  <th>Source</th>
                  <th>Arch.Id</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--color-accent)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                      {s.scen_id ?? '—'}
                    </td>
                    <td style={{ color: 'var(--color-text)', fontWeight: 500 }}>{s.title}</td>
                    <td style={{ color: 'var(--color-text)', letterSpacing: '0.06em' }}>{toTitleCase(s.attacker_nationality)}</td>
                    <td style={{ color: 'var(--color-text)', letterSpacing: '0.06em' }}>{toTitleCase(s.defender_nationality)}</td>
                    <td style={{ color: 'var(--color-muted)' }}>{s.source ?? '—'}</td>
                    <td style={{ color: 'var(--color-muted)' }}>{s.archive_id ?? ''}</td>
                    <td>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => navigate({ to: '/scenarios/$id/edit', params: { id: s.id } })}
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
