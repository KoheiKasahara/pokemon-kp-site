import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTournaments } from '../lib/api';
import { formatDate } from '../lib/format';
import type { Tournament } from '../types/api';
import { ErrorState, LoadingState } from '../components/AsyncState';

export function TournamentListPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTournaments().then(setTournaments).catch((reason: unknown) => setError(String(reason instanceof Error ? reason.message : reason)));
  }, []);

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">TOURNAMENTS</p>
        <h1>大会一覧</h1>
        <p>公開済みのエメラルド大会と、ポケモンの使用状況を確認できます。</p>
      </div>

      {error && <ErrorState message={error} />}
      {!error && tournaments.length === 0 && <LoadingState />}
      <div className="tournament-list">
        {tournaments.map((tournament) => (
          <Link key={tournament.tournament_id} to={`/tournaments/${tournament.tournament_id}`} className="tournament-card">
            <span className="game-tag">{tournament.game === 'emerald' ? 'エメラルド' : tournament.game}</span>
            <h2>{tournament.name}</h2>
            <dl>
              <div><dt>開催日</dt><dd>{formatDate(tournament.held_on)}</dd></div>
              <div><dt>参加人数</dt><dd>{tournament.participant_count}人</dd></div>
            </dl>
            <p>{tournament.rule_summary}</p>
            <span className="card-link">集計結果を見る →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
