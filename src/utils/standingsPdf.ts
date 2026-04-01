import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── shared types ─────────────────────────────────────────────

export interface PlayerRow {
  id: string;
  name: string;
}

export interface GameResult {
  winner_id: string | null;
  player1_id: string;
  player2_id: string;
}

export interface StandingEntry {
  player:  PlayerRow;
  wins:    number;
  losses:  number;
  points:  number;   // 10×wins + Σwins_of_defeated_opponents
  tb1:     number;   // Σ final_points of defeated opponents
  tb2:     number;   // Σ final_points of victorious opponents
  rank:    number;
}

// ─── standings computation ────────────────────────────────────

export function computeStandings(players: PlayerRow[], games: GameResult[]): StandingEntry[] {
  const completed = games.filter(g => g.winner_id !== null);

  // Pass 1: wins per player
  const wins:   Record<string, number> = {};
  const losses: Record<string, number> = {};
  for (const p of players) { wins[p.id] = 0; losses[p.id] = 0; }
  for (const g of completed) {
    const loserId = g.winner_id === g.player1_id ? g.player2_id : g.player1_id;
    wins[g.winner_id!]  = (wins[g.winner_id!]  ?? 0) + 1;
    losses[loserId]     = (losses[loserId]      ?? 0) + 1;
  }

  // Pass 2: points = 10×wins + Σwins[defeated_opponent]
  // Also track who each player defeated / lost to
  const defeated: Record<string, string[]> = {};  // player -> list of opponents they beat
  const lostTo:   Record<string, string[]> = {};  // player -> list of opponents who beat them
  for (const p of players) { defeated[p.id] = []; lostTo[p.id] = []; }
  for (const g of completed) {
    const loserId = g.winner_id === g.player1_id ? g.player2_id : g.player1_id;
    defeated[g.winner_id!].push(loserId);
    lostTo[loserId].push(g.winner_id!);
  }

  const points: Record<string, number> = {};
  for (const p of players) {
    const bonus = defeated[p.id].reduce((sum, oppId) => sum + (wins[oppId] ?? 0), 0);
    points[p.id] = 10 * (wins[p.id] ?? 0) + bonus;
  }

  // Pass 3: tie-breakers using final points
  const entries: StandingEntry[] = players.map(p => {
    const tb1 = defeated[p.id].reduce((sum, oppId) => sum + (points[oppId] ?? 0), 0);
    const tb2 = lostTo[p.id].reduce((sum, oppId)   => sum + (points[oppId] ?? 0), 0);
    return { player: p, wins: wins[p.id] ?? 0, losses: losses[p.id] ?? 0, points: points[p.id] ?? 0, tb1, tb2, rank: 0 };
  });

  // Sort: points desc, tb1 desc, tb2 desc, name asc
  entries.sort((a, b) =>
    b.points - a.points ||
    b.tb1    - a.tb1    ||
    b.tb2    - a.tb2    ||
    a.player.name.localeCompare(b.player.name)
  );

  // Assign ranks (ties share rank)
  let rank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0) {
      const prev = entries[i - 1];
      const curr = entries[i];
      if (curr.points !== prev.points || curr.tb1 !== prev.tb1 || curr.tb2 !== prev.tb2) {
        rank = i + 1;
      }
    }
    entries[i].rank = rank;
  }

  return entries;
}

// ─── PDF generation ───────────────────────────────────────────

function rankLabel(rank: number) {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

export function downloadStandingsPdf(standings: StandingEntry[], tournamentName: string): void {
  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'letter' });

  if (standings.length === 0) {
    doc.text('No standings yet.', 20, 20);
  } else {
    doc.text(`${tournamentName} Standings`, 40, 30);
    const headers = ['#', 'Player', 'W', 'L', 'Base', 'Bonus', 'Pts', 'TB1', 'TB2'];
    const rows = standings.map(s => {
      const base  = s.wins * 10;
      const bonus = s.points - base;
      const isTied = standings.filter(x => x.rank === s.rank).length > 1;
      return [
        `${rankLabel(s.rank)}${isTied ? '=' : ''}`,
        s.player.name,
        s.wins,
        s.losses,
        base,
        `+${bonus}`,
        s.points,
        s.tb1,
        s.tb2,
      ];
    });
    autoTable(doc, { head: [headers], body: rows });
  }

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
