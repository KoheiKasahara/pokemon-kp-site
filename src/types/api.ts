export type Tournament = {
  tournament_id: string;
  name: string;
  held_on: string;
  game: string;
  rule_summary: string;
  participant_count: number;
  source_url: string;
  note: string;
};

export type PokemonStat = {
  pokemon_name: string;
  usage_rate: number;
  kp: number;
};

export type Entry = {
  entry_id: string;
  tournament_id: string;
  user_name: string;
  placement: number | null;
  pokemon: string[];
  note: string;
  party_kp: number;
  submission_order?: number;
};

export type TournamentDetail = {
  tournament: Tournament & { valid_entry_count: number };
  pokemon_stats: PokemonStat[];
  entries: Entry[];
};

export type DataVersion = {
  generated_at: string | null;
  tournament_count: number;
};

export type PokemonDefinition = {
  id: string;
  name: string;
  image?: string;
};
