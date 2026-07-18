type Tournament = {
  tournament_id: string;
  name: string;
  held_on: string;
  game: string;
  rule_summary: string;
  participant_count: number;
  source_url: string;
  note: string;
};

type TournamentDetail = {
  tournament: Tournament & { valid_entry_count: number };
  pokemon_stats: Array<{ pokemon_name: string; usage_rate: number; kp: number }>;
  entries: Array<{
    entry_id: string;
    tournament_id: string;
    user_name: string;
    placement: number | null;
    pokemon: string[];
    note: string;
    party_kp: number;
    submission_order?: number;
  }>;
};

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error?: { message?: string } };

const apiUrl = process.env.GAS_API_URL?.trim();
const outputDirectory = new URL('../public/data/', import.meta.url);

if (!apiUrl) {
  throw new Error('GAS_API_URL が未設定です。GitHub Actionsの Repository secret にGASの /exec URLを設定してください。');
}

async function request<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(apiUrl);
  url.search = new URLSearchParams(params).toString();

  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (error) {
    throw new Error(`GAS APIへ接続できませんでした: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!response.ok) {
    throw new Error(`GAS APIがHTTP ${response.status} を返しました。`);
  }

  let payload: ApiSuccess<T> | ApiFailure;
  try {
    payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    throw new Error('GAS APIがJSONではない応答を返しました。/exec URLを設定しているか確認してください。');
  }

  if (!payload.ok) {
    throw new Error(`GAS APIの取得に失敗しました: ${payload.error?.message ?? '不明なエラー'}`);
  }
  return payload.data;
}

function validateTournaments(value: Tournament[]): void {
  const ids = new Set<string>();
  for (const tournament of value) {
    if (!tournament?.tournament_id || ids.has(tournament.tournament_id)) {
      throw new Error('GAS APIの大会一覧に空または重複した tournament_id があります。');
    }
    ids.add(tournament.tournament_id);
  }
}

async function writeJson(fileName: string, value: unknown): Promise<void> {
  const { mkdir, rename, writeFile } = await import('node:fs/promises');
  await mkdir(outputDirectory, { recursive: true });
  const destination = new URL(fileName, outputDirectory);
  const temporary = new URL(`${fileName}.tmp`, outputDirectory);
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporary, destination);
}

async function generateData(): Promise<void> {
  const tournaments = await request<Tournament[]>({ resource: 'tournaments' });
  if (!Array.isArray(tournaments)) {
    throw new Error('GAS APIの大会一覧が配列ではありません。');
  }
  validateTournaments(tournaments);

  const details = await Promise.all(tournaments.map(async (tournament) => {
    const detail = await request<TournamentDetail>({ resource: 'tournament', id: tournament.tournament_id });
    if (detail.tournament?.tournament_id !== tournament.tournament_id) {
      throw new Error(`大会「${tournament.tournament_id}」の詳細データが一致しません。`);
    }
    return [tournament.tournament_id, detail] as const;
  }));

  await Promise.all([
    writeJson('tournaments.json', tournaments),
    writeJson('tournament-details.json', Object.fromEntries(details)),
    writeJson('version.json', {
      generated_at: new Date().toISOString(),
      tournament_count: tournaments.length,
    }),
  ]);

  console.log(`${tournaments.length}件の大会データを生成しました。`);
}

await generateData();
