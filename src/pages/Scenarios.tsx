import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch, Link } from '@tanstack/react-router';
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
    .order('title')
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (term) {
    q = q.or(
      `title.ilike.%${term}%,scen_id.ilike.%${term}%,source.ilike.%${term}%,` +
      `attacker_nationality.ilike.%${term}%,defender_nationality.ilike.%${term}%`
    );
  }

  return q;
}

export default function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { q } = useSearch({ from: '/scenarios' });
  const search = q ?? '';

  function setSearch(value: string) {
    navigate({ to: '/scenarios', search: { q: value }, replace: true });
  }

  const pageRef = useRef(0);
  const searchRef = useRef('');
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load first page whenever search changes (debounced)
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
      setScenarios(rows);
      setHasMore(more);
      hasMoreRef.current = more;
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
          setScenarios(prev => [...prev, ...rows]);
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
          <div className="section-label mb-[0.3rem]">Scenario Library</div>
          <h1 className="text-[2.4rem] tracking-[0.06em] m-0">
            Scenarios
            {!loading && (
              <span className="mono text-[0.85rem] text-accent ml-3 tracking-widest">
                {scenarios.length}{hasMore ? '+' : ''}
              </span>
            )}
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Search scenarios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-55"
          />
          <Link to="/scenarios/new" className="btn-primary">+ Add Scenario</Link>
        </div>
      </div>

      <div className="card anim-1 p-0 overflow-hidden">
        {loading ? (
          <div className="row justify-center p-12">
            <div className="spinner" /><span className="section-label">Loading...</span>
          </div>
        ) : error ? (
          <div className="error-box">{error}</div>
        ) : scenarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
            <h3 className="text-[1.4rem] tracking-[0.06em] text-muted m-0">
              {search ? 'No Matches Found' : 'No Scenarios Loaded'}
            </h3>
            <p className="text-[0.95rem] text-muted-dim m-0 text-center">
              {search ? 'Try a different search term' : 'Import scenarios via the SQL migration'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    <td className="text-accent tracking-[0.08em] whitespace-nowrap">
                      {s.scen_id ?? '—'}
                    </td>
                    <td className="text-text font-medium">{s.title}</td>
                    <td className="text-text tracking-[0.06em]">{toTitleCase(s.attacker_nationality)}</td>
                    <td className="text-text tracking-[0.06em]">{toTitleCase(s.defender_nationality)}</td>
                    <td className="text-muted">{s.source ?? '—'}</td>
                    <td className="text-muted">{s.archive_id ?? ''}</td>
                    <td>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => navigate({ to: '/scenarios/$id/edit', params: { id: s.id }, search: { q: search } })}
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
