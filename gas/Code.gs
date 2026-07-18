/**
 * KP集計サイト用の読み取り専用API。
 *
 * スプレッドシートの「公開_大会」「公開_参加者」「公開_ポケモン集計」だけをJSONとして返す。
 * Googleスプレッドシートの [拡張機能] > [Apps Script] に貼り付け、ウェブアプリとしてデプロイする。
 */

const CONFIG = Object.freeze({
  // スプレッドシートURLの /d/ と /edit の間にあるIDを貼る。
  // このスクリプトを対象スプレッドシートに紐づけていても、Webアプリでは明示指定を推奨。
  SPREADSHEET_ID: 'PASTE_SPREADSHEET_ID_HERE',
  HEADER_ROW: 4,
  TIME_ZONE: 'Asia/Tokyo',
  SHEET_NAMES: Object.freeze({
    tournaments: '公開_大会',
    entries: '公開_参加者',
    pokemonStats: '公開_ポケモン集計',
  }),
});

const REQUIRED_HEADERS = Object.freeze({
  tournaments: ['tournament_id', 'name', 'held_on', 'game', 'rule_summary', 'participant_count', 'source_url', 'note', 'published'],
  entries: ['entry_id', 'tournament_id', 'user_name', 'placement', 'pokemon_1', 'pokemon_2', 'pokemon_3', 'pokemon_4', 'pokemon_5', 'pokemon_6', 'note'],
  pokemonStats: ['tournament_id', 'pokemon_name', 'usage_rate', 'kp'],
});

/**
 * Webアプリのエントリーポイント。
 *
 *  ?resource=tournaments
 *  ?resource=tournament&id=emerald-sample-a
 *  ?resource=users&q=アオイ
 */
function doGet(event) {
  const params = (event && event.parameter) || {};

  try {
    const resource = String(params.resource || '').trim().toLowerCase();

    switch (resource) {
      case 'tournaments':
        return jsonResponse_(getTournaments_());

      case 'tournament':
        return jsonResponse_(getTournament_(String(params.id || '').trim()));

      case 'users':
        return jsonResponse_(searchUsers_(String(params.q || '').trim()));

      default:
        return jsonResponse_(apiError_(400, 'invalid_resource', 'resource は tournaments / tournament / users のいずれかを指定してください。'));
    }
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return jsonResponse_(apiError_(500, 'internal_error', 'データの取得に失敗しました。'));
  }
}

function getTournaments_() {
  const tournaments = getPublishedTournaments_()
    .sort((left, right) => String(right.held_on).localeCompare(String(left.held_on), 'ja'));

  return {
    ok: true,
    data: tournaments.map((tournament) => publicTournament_(tournament)),
  };
}

function getTournament_(tournamentId) {
  if (!tournamentId) {
    return apiError_(400, 'missing_id', 'id は必須です。');
  }

  const tournament = getPublishedTournaments_().find((item) => item.tournament_id === tournamentId);
  if (!tournament) {
    return apiError_(404, 'tournament_not_found', '公開中の大会が見つかりません。');
  }

  const entries = getRows_('entries')
    .filter((entry) => entry.tournament_id === tournamentId)
    .map((entry, index) => ({
      ...publicEntry_(entry),
      submission_order: index + 1,
    }));

  const stats = getRows_('pokemonStats')
    .filter((stat) => stat.tournament_id === tournamentId)
    .map(publicPokemonStat_)
    .sort((left, right) => right.kp - left.kp || left.pokemon_name.localeCompare(right.pokemon_name, 'ja'));

  const kpByPokemonName = new Map(stats.map((stat) => [stat.pokemon_name, stat.kp]));
  const entriesWithKp = entries.map((entry) => ({
    ...entry,
    party_kp: entry.pokemon.reduce((sum, pokemonName) => sum + (kpByPokemonName.get(pokemonName) || 0), 0),
  }));

  return {
    ok: true,
    data: {
      tournament: {
        ...publicTournament_(tournament),
        // KP・使用率の分母。participant_count（公式参加人数）とは別の値。
        valid_entry_count: entries.length,
      },
      pokemon_stats: stats,
      entries: entriesWithKp,
    },
  };
}

function searchUsers_(query) {
  if (!query) {
    return apiError_(400, 'missing_query', 'q は必須です。');
  }

  const publishedTournamentIds = new Set(getPublishedTournaments_().map((tournament) => tournament.tournament_id));
  const normalizedQuery = normalizeSearchText_(query);
  const statsByTournament = new Map();

  getRows_('pokemonStats').forEach((stat) => {
    if (!publishedTournamentIds.has(stat.tournament_id)) {
      return;
    }
    if (!statsByTournament.has(stat.tournament_id)) {
      statsByTournament.set(stat.tournament_id, new Map());
    }
    statsByTournament.get(stat.tournament_id).set(stat.pokemon_name, toNumber_(stat.kp));
  });

  const results = getRows_('entries')
    .filter((entry) => publishedTournamentIds.has(entry.tournament_id))
    .filter((entry) => normalizeSearchText_(entry.user_name).includes(normalizedQuery))
    .map((entry) => {
      const publicEntry = publicEntry_(entry);
      const kpByPokemonName = statsByTournament.get(entry.tournament_id) || new Map();
      return {
        ...publicEntry,
        party_kp: publicEntry.pokemon.reduce((sum, pokemonName) => sum + (kpByPokemonName.get(pokemonName) || 0), 0),
      };
    });

  return {
    ok: true,
    data: {
      query,
      results,
    },
  };
}

function getPublishedTournaments_() {
  return getRows_('tournaments').filter((tournament) => isPublished_(tournament.published));
}

function getRows_(sheetKey) {
  const spreadsheet = getSpreadsheet_();
  const sheetName = CONFIG.SHEET_NAMES[sheetKey];
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`シート「${sheetName}」が見つかりません。`);
  }

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < CONFIG.HEADER_ROW || lastColumn === 0) {
    throw new Error(`シート「${sheetName}」にヘッダー行がありません。`);
  }

  const values = sheet
    .getRange(CONFIG.HEADER_ROW, 1, lastRow - CONFIG.HEADER_ROW + 1, lastColumn)
    .getValues();
  const headers = values.shift().map((header) => String(header).trim());
  validateHeaders_(sheetKey, headers);

  return values
    .filter((row) => row.some((cell) => String(cell).trim() !== ''))
    .map((row) => rowToObject_(headers, row));
}

function getSpreadsheet_() {
  if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID === 'PASTE_SPREADSHEET_ID_HERE') {
    throw new Error('CONFIG.SPREADSHEET_ID を設定してください。');
  }
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function validateHeaders_(sheetKey, headers) {
  const missing = REQUIRED_HEADERS[sheetKey].filter((requiredHeader) => !headers.includes(requiredHeader));
  if (missing.length > 0) {
    throw new Error(`シート「${CONFIG.SHEET_NAMES[sheetKey]}」に必要な列がありません: ${missing.join(', ')}`);
  }
}

function rowToObject_(headers, row) {
  return headers.reduce((record, header, index) => {
    record[header] = serializeCell_(row[index]);
    return record;
  }, {});
}

function serializeCell_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !Number.isNaN(value.getTime())) {
    return Utilities.formatDate(value, CONFIG.TIME_ZONE, 'yyyy-MM-dd');
  }
  return value === null ? '' : value;
}

function publicTournament_(tournament) {
  return {
    tournament_id: String(tournament.tournament_id),
    name: String(tournament.name),
    held_on: String(tournament.held_on),
    game: String(tournament.game),
    rule_summary: String(tournament.rule_summary),
    participant_count: toNumber_(tournament.participant_count),
    source_url: String(tournament.source_url || ''),
    note: String(tournament.note || ''),
  };
}

function publicEntry_(entry) {
  return {
    entry_id: String(entry.entry_id),
    tournament_id: String(entry.tournament_id),
    user_name: String(entry.user_name),
    placement: entry.placement === '' ? null : toNumber_(entry.placement),
    pokemon: [entry.pokemon_1, entry.pokemon_2, entry.pokemon_3, entry.pokemon_4, entry.pokemon_5, entry.pokemon_6]
      .map((pokemonName) => String(pokemonName || '').trim())
      .filter(Boolean),
    note: String(entry.note || ''),
  };
}

function publicPokemonStat_(stat) {
  return {
    pokemon_name: String(stat.pokemon_name),
    usage_rate: toNumber_(stat.usage_rate),
    kp: toNumber_(stat.kp),
  };
}

function isPublished_(value) {
  return value === true || String(value).trim().toUpperCase() === 'TRUE';
}

function toNumber_(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeSearchText_(text) {
  return String(text || '').trim().normalize('NFKC').toLocaleLowerCase('ja');
}

function apiError_(status, code, message) {
  return {
    ok: false,
    error: { status, code, message },
  };
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Apps Scriptのエディタから実行して、設定とシート名を確認するための関数。 */
function testGetTournaments() {
  console.log(JSON.stringify(getTournaments_(), null, 2));
}
