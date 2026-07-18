import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/AsyncState';
import { EntryCard } from '../components/EntryCard';
import { PokemonChip } from '../components/PokemonChip';
import { fetchTournament } from '../lib/api';
import { formatDate, formatRate } from '../lib/format';
import type { TournamentDetail } from '../types/api';

export function TournamentDetailPage() {
  const { tournamentId = '' } = useParams();
  const [detail, setDetail] = useState<TournamentDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTournament(tournamentId).then(setDetail).catch((reason: unknown) => setError(String(reason instanceof Error ? reason.message : reason)));
  }, [tournamentId]);

  if (error) return <ErrorState message={error} />;
  if (!detail) return <LoadingState />;

  const { tournament, pokemon_stats: pokemonStats, entries } = detail;
  return (
    <section>
      <Link className="back-link" to="/">← 大会一覧へ</Link>
      <div className="detail-hero">
        <span className="game-tag">{tournament.game === 'emerald' ? 'エメラルド' : tournament.game}</span>
        <h1>{tournament.name}</h1>
        <p>{formatDate(tournament.held_on)} · {tournament.rule_summary}</p>
        <div className="stat-cards">
          <div><span>大会参加人数</span><strong>{tournament.participant_count}人</strong></div>
          <div><span>KP集計対象</span><strong>{tournament.valid_entry_count}人</strong></div>
        </div>
        {tournament.note && <p className="detail-note">{tournament.note}</p>}
        {tournament.source_url && <a className="source-link" href={tournament.source_url} target="_blank" rel="noreferrer">大会情報・出典 ↗</a>}
      </div>

      <section className="content-section">
        <div className="section-heading"><p className="eyebrow">KP STATS</p><h2>ポケモン別KP</h2></div>
        <p className="section-description">KPは大会内での使用人数です。使用率はパーティが判明している集計対象者数を分母にしています。</p>
        <div className="stats-table-wrap">
          <table className="stats-table">
            <thead><tr><th>ポケモン</th><th>KP</th><th>使用率</th></tr></thead>
            <tbody>{pokemonStats.map((stat) => (
              <tr key={stat.pokemon_name}>
                <td><PokemonChip name={stat.pokemon_name} /></td>
                <td className="kp-cell">{stat.kp}</td>
                <td>{formatRate(stat.usage_rate)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading"><p className="eyebrow">PARTIES</p><h2>参加者の使用ポケモン</h2></div>
        <div className="entry-list">{entries.map((entry) => <EntryCard key={entry.entry_id} entry={entry} />)}</div>
      </section>
    </section>
  );
}
