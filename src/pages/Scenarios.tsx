import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabase';
import { toTitleCase } from '@/utils/format';

interface Scenario {
  id: string;
  scen_id: string | null;
  title: string;
  attacker_nationality: string;
  defender_nationality: string;
  source: string | null;
}

export default function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('scenarios')
      .select('id, scen_id, title, attacker_nationality, defender_nationality, source')
      .order('source')
      .order('title')
      .then(({ data, error }) => {
        if (error) { console.error(error); setError(error.message); }
        else setScenarios(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = search.trim()
    ? scenarios.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.scen_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (s.source ?? '').toLowerCase().includes(search.toLowerCase()) ||
        s.attacker_nationality.toLowerCase().includes(search.toLowerCase()) ||
        s.defender_nationality.toLowerCase().includes(search.toLowerCase())
      )
    : scenarios;

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
                {filtered.length}
              </span>
            )}
          </h1>
        </div>
        <input
          type="text"
          placeholder="Search scenarios..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
          style={{ width: '220px' }}
        />
      </div>

      <div className="card anim-1" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="row" style={{ justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" /><span className="section-label">Loading...</span>
          </div>
        ) : error ? (
          <div className="error-box">
            {error}
          </div>
        ) : filtered.length === 0 ? (
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
                  <th>ID</th>
                  <th>Title</th>
                  <th>Attacker</th>
                  <th>Defender</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--color-accent)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                      {s.scen_id ?? '—'}
                    </td>
                    <td style={{ color: 'var(--color-text)', fontWeight: 500 }}>{s.title}</td>
                    <td style={{ color: 'var(--color-text)', letterSpacing: '0.06em' }}>{toTitleCase(s.attacker_nationality)}</td>
                    <td style={{ color: 'var(--color-text)', letterSpacing: '0.06em' }}>{toTitleCase(s.defender_nationality)}</td>
                    <td style={{ color: 'var(--color-muted)' }}>{s.source ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
