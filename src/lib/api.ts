import type { Entry, Tournament, TournamentDetail } from '../types/api';

const API_URL = 'https://script.google.com/macros/s/AKfycbyyPH0W9otYkyb5MKqlHVJ5FkHe7sgcbdgjU9c3RiW_KdKR06xRbs1pHLulKgT1iQ4v/exec';

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: { status: number; code: string; message: string } };
type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

async function request<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(API_URL);
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error('APIへ接続できませんでした。時間をおいて再試行してください。');
  }

  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.ok) {
    throw new Error(payload.error.message);
  }
  return payload.data;
}

export function fetchTournaments() {
  return request<Tournament[]>({ resource: 'tournaments' });
}

export function fetchTournament(tournamentId: string) {
  return request<TournamentDetail>({ resource: 'tournament', id: tournamentId });
}

export function searchUsers(query: string) {
  return request<{ query: string; results: Entry[] }>({ resource: 'users', q: query });
}
