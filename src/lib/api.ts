import type { DataVersion, Entry, Tournament, TournamentDetail } from '../types/api';

const DATA_URL = `${import.meta.env.BASE_URL}data/`;

async function request<T>(fileName: string): Promise<T> {
  const response = await fetch(`${DATA_URL}${fileName}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error('公開データを読み込めませんでした。時間をおいて再試行してください。');
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error('公開データの形式が不正です。');
  }
}

export function fetchTournaments() {
  return request<Tournament[]>('tournaments.json');
}

async function fetchTournamentDetails() {
  return request<Record<string, TournamentDetail>>('tournament-details.json');
}

export async function fetchTournament(tournamentId: string) {
  const details = await fetchTournamentDetails();
  const detail = details[tournamentId];
  if (!detail) {
    throw new Error('指定された大会の公開データが見つかりません。');
  }
  return detail;
}

export async function searchUsers(query: string) {
  const normalizedQuery = query.trim().normalize('NFKC').toLocaleLowerCase('ja');
  const details = await fetchTournamentDetails();
  const results = Object.values(details)
    .flatMap((detail) => detail.entries)
    .filter((entry) => entry.user_name.normalize('NFKC').toLocaleLowerCase('ja').includes(normalizedQuery));

  return { query, results };
}

export function fetchDataVersion() {
  return request<DataVersion>('version.json');
}
