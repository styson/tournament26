import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabase';

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
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Scenarios
            {!loading && (
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.85rem', color: '#b8861a', marginLeft: '0.75rem', letterSpacing: '0.1em' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid #282420', borderTopColor: '#b8861a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: '#9a8e7e', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Loading...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: '1.25rem', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: '#c46060', border: '1px solid #5a1e1e' }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '4rem', color: '#1e1c18', letterSpacing: '0.05em' }}>SC-00</div>
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', letterSpacing: '0.06em', color: '#9a8e7e', margin: 0 }}>
              {search ? 'No Matches Found' : 'No Scenarios Loaded'}
            </h3>
            <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: '#706858', margin: 0, textAlign: 'center' }}>
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
                    <td style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: '#b8861a', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                      {s.scen_id ?? '—'}
                    </td>
                    <td style={{ color: '#ddd4bc', fontWeight: 500 }}>{s.title}</td>
                    <td style={{ color: '#c46060', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.06em' }}>{s.attacker_nationality}</td>
                    <td style={{ color: '#6a9c68', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.06em' }}>{s.defender_nationality}</td>
                    <td style={{ color: '#9a8e7e', fontSize: '0.75rem' }}>{s.source ?? '—'}</td>
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
