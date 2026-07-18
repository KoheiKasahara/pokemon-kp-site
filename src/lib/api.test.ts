import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchTournament, fetchTournaments, searchUsers } from './api';

const fetchMock = vi.fn();

function mockJsonResponse(payload: unknown, ok = true) {
  fetchMock.mockResolvedValueOnce({
    ok,
    json: vi.fn().mockResolvedValue(payload),
  });
}

describe('API client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('大会一覧の静的JSONを取得する', async () => {
    vi.stubGlobal('fetch', fetchMock);
    mockJsonResponse([]);

    await expect(fetchTournaments()).resolves.toEqual([]);

    expect(fetchMock.mock.calls[0][0]).toContain('data/tournaments.json');
  });

  it('大会IDを指定して大会詳細を取得する', async () => {
    vi.stubGlobal('fetch', fetchMock);
    const detail = { tournament: {}, pokemon_stats: [], entries: [] };
    mockJsonResponse({ 'tournament 01': detail });

    await expect(fetchTournament('tournament 01')).resolves.toEqual(detail);

    expect(fetchMock.mock.calls[0][0]).toContain('data/tournament-details.json');
  });

  it('検索語を指定してユーザーを検索する', async () => {
    vi.stubGlobal('fetch', fetchMock);
    mockJsonResponse({
      'tournament 01': {
        tournament: {},
        pokemon_stats: [],
        entries: [{ entry_id: 'entry-1', user_name: 'アオイ', pokemon: [], party_kp: 0 }],
      },
    });

    await expect(searchUsers('アオイ')).resolves.toEqual({
      query: 'アオイ',
      results: [{ entry_id: 'entry-1', user_name: 'アオイ', pokemon: [], party_kp: 0 }],
    });

    expect(fetchMock.mock.calls[0][0]).toContain('data/tournament-details.json');
  });

  it('HTTPエラー時は公開データの読み込みエラーを返す', async () => {
    vi.stubGlobal('fetch', fetchMock);
    mockJsonResponse({}, false);

    await expect(fetchTournaments()).rejects.toThrow('公開データを読み込めませんでした。時間をおいて再試行してください。');
  });

  it('存在しない大会IDはエラーにする', async () => {
    vi.stubGlobal('fetch', fetchMock);
    mockJsonResponse({});

    await expect(fetchTournament('unknown')).rejects.toThrow('指定された大会の公開データが見つかりません。');
  });
});
