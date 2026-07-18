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

  it('大会一覧を取得するリクエストを送る', async () => {
    vi.stubGlobal('fetch', fetchMock);
    mockJsonResponse({ ok: true, data: [] });

    await expect(fetchTournaments()).resolves.toEqual([]);

    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.searchParams.get('resource')).toBe('tournaments');
  });

  it('大会IDを指定して大会詳細を取得する', async () => {
    vi.stubGlobal('fetch', fetchMock);
    const detail = { tournament: {}, pokemon_stats: [], entries: [] };
    mockJsonResponse({ ok: true, data: detail });

    await expect(fetchTournament('tournament 01')).resolves.toEqual(detail);

    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.searchParams.get('resource')).toBe('tournament');
    expect(requestUrl.searchParams.get('id')).toBe('tournament 01');
  });

  it('検索語を指定してユーザーを検索する', async () => {
    vi.stubGlobal('fetch', fetchMock);
    const result = { query: 'アオイ', results: [] };
    mockJsonResponse({ ok: true, data: result });

    await expect(searchUsers('アオイ')).resolves.toEqual(result);

    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.searchParams.get('resource')).toBe('users');
    expect(requestUrl.searchParams.get('q')).toBe('アオイ');
  });

  it('HTTPエラー時は接続エラーを返す', async () => {
    vi.stubGlobal('fetch', fetchMock);
    mockJsonResponse({}, false);

    await expect(fetchTournaments()).rejects.toThrow('APIへ接続できませんでした。時間をおいて再試行してください。');
  });

  it('APIが返したエラー内容をそのまま返す', async () => {
    vi.stubGlobal('fetch', fetchMock);
    mockJsonResponse({
      ok: false,
      error: { status: 400, code: 'INVALID_QUERY', message: '検索語を入力してください。' },
    });

    await expect(searchUsers('')).rejects.toThrow('検索語を入力してください。');
  });
});
