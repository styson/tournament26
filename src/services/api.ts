import { get, post, put, del } from 'aws-amplify/api';
import type {
  Player,
  Tournament,
  Round,
  Game,
  Scenario,
  Standing,
  PlayerFormData,
  TournamentFormData,
  GameFormData,
  GameResultFormData,
} from '@/types';

const API_NAME = 'TournamentAPI';

// Player API
export const playerApi = {
  getAll: async (): Promise<Player[]> => {
    const response = await get({ apiName: API_NAME, path: '/players' }).response;
    const data = await response.body.json();
    return data as unknown as Player[];
  },

  getById: async (id: string): Promise<Player> => {
    const response = await get({ apiName: API_NAME, path: `/players/${id}` }).response;
    const data = await response.body.json();
    return data as unknown as Player;
  },

  create: async (player: PlayerFormData): Promise<Player> => {
    const response = await post({
      apiName: API_NAME,
      path: '/players',
      options: { body: player as any },
    }).response;
    const data = await response.body.json();
    return data as unknown as Player;
  },

  update: async (id: string, player: Partial<PlayerFormData>): Promise<Player> => {
    const response = await put({
      apiName: API_NAME,
      path: `/players/${id}`,
      options: { body: player as any },
    }).response;
    const data = await response.body.json();
    return data as unknown as Player;
  },

  delete: async (id: string): Promise<void> => {
    await del({ apiName: API_NAME, path: `/players/${id}` }).response;
  },
};

// Tournament API
export const tournamentApi = {
  getAll: async (): Promise<Tournament[]> => {
    const response = await get({ apiName: API_NAME, path: '/tournaments' }).response;
    const data = await response.body.json();
    return data as unknown as Tournament[];
  },

  getById: async (id: string): Promise<Tournament> => {
    const response = await get({ apiName: API_NAME, path: `/tournaments/${id}` }).response;
    const data = await response.body.json();
    return data as unknown as Tournament;
  },

  create: async (tournament: TournamentFormData): Promise<Tournament> => {
    const response = await post({
      apiName: API_NAME,
      path: '/tournaments',
      options: { body: tournament as any },
    }).response;
    const data = await response.body.json();
    return data as unknown as Tournament;
  },

  update: async (id: string, tournament: Partial<TournamentFormData>): Promise<Tournament> => {
    const response = await put({
      apiName: API_NAME,
      path: `/tournaments/${id}`,
      options: { body: tournament as any },
    }).response;
    const data = await response.body.json();
    return data as unknown as Tournament;
  },

  delete: async (id: string): Promise<void> => {
    await del({ apiName: API_NAME, path: `/tournaments/${id}` }).response;
  },
};

// Game API
export const gameApi = {
  getAll: async (tournamentId?: string): Promise<Game[]> => {
    const path = tournamentId ? `/games?tournamentId=${tournamentId}` : '/games';
    const response = await get({ apiName: API_NAME, path }).response;
    const data = await response.body.json();
    return data as unknown as Game[];
  },

  getById: async (id: string): Promise<Game> => {
    const response = await get({ apiName: API_NAME, path: `/games/${id}` }).response;
    const data = await response.body.json();
    return data as unknown as Game;
  },

  create: async (game: GameFormData): Promise<Game> => {
    const response = await post({
      apiName: API_NAME,
      path: '/games',
      options: { body: game as any },
    }).response;
    const data = await response.body.json();
    return data as unknown as Game;
  },

  updateResult: async (id: string, result: GameResultFormData): Promise<Game> => {
    const response = await put({
      apiName: API_NAME,
      path: `/games/${id}/result`,
      options: { body: result as any },
    }).response;
    const data = await response.body.json();
    return data as unknown as Game;
  },
};

// Scenario API
export const scenarioApi = {
  getAll: async (): Promise<Scenario[]> => {
    const response = await get({ apiName: API_NAME, path: '/scenarios' }).response;
    const data = await response.body.json();
    return data as unknown as Scenario[];
  },

  getById: async (id: string): Promise<Scenario> => {
    const response = await get({ apiName: API_NAME, path: `/scenarios/${id}` }).response;
    const data = await response.body.json();
    return data as unknown as Scenario;
  },
};

// Standings API
export const standingsApi = {
  getByTournament: async (tournamentId: string): Promise<Standing[]> => {
    const response = await get({
      apiName: API_NAME,
      path: `/tournaments/${tournamentId}/standings`,
    }).response;
    const data = await response.body.json();
    return data as unknown as Standing[];
  },
};

// Round API
export const roundApi = {
  getByTournament: async (tournamentId: string): Promise<Round[]> => {
    const response = await get({
      apiName: API_NAME,
      path: `/tournaments/${tournamentId}/rounds`,
    }).response;
    const data = await response.body.json();
    return data as unknown as Round[];
  },

  create: async (tournamentId: string, round: Partial<Round>): Promise<Round> => {
    const response = await post({
      apiName: API_NAME,
      path: `/tournaments/${tournamentId}/rounds`,
      options: { body: round as any },
    }).response;
    const data = await response.body.json();
    return data as unknown as Round;
  },
};
