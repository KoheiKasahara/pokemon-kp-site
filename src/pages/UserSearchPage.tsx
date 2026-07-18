import { FormEvent, useState } from 'react';
import { EntryCard } from '../components/EntryCard';
import { ErrorState } from '../components/AsyncState';
import { searchUsers } from '../lib/api';
import type { Entry } from '../types/api';

export function UserSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Entry[] | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await searchUsers(query.trim());
      setResults(data.results);
    } catch (reason) {
      setError(String(reason instanceof Error ? reason.message : reason));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">USERS</p>
        <h1>ユーザー検索</h1>
        <p>表示名の一部を入力すると、掲載済み大会での使用パーティを検索できます。</p>
      </div>
      <form className="search-form" onSubmit={handleSubmit}>
        <label htmlFor="user-search">表示名</label>
        <div><input id="user-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例: アオイ" /><button type="submit" disabled={isLoading}>{isLoading ? '検索中…' : '検索'}</button></div>
      </form>
      {error && <ErrorState message={error} />}
      {results && !error && (
        <section className="content-section search-results">
          <h2>検索結果 <span>{results.length}件</span></h2>
          {results.length === 0 ? <p className="state-message">該当するユーザーは見つかりませんでした。</p> : <div className="entry-list">{results.map((entry) => <EntryCard key={entry.entry_id} entry={entry} />)}</div>}
        </section>
      )}
    </section>
  );
}
