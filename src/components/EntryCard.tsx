import type { Entry } from '../types/api';
import { PokemonChip } from './PokemonChip';

export function EntryCard({ entry }: { entry: Entry }) {
  return (
    <article className="entry-card">
      <div className="entry-heading">
        <div>
          <span className="entry-order">{entry.placement ? `${entry.placement}位` : `${entry.submission_order ?? ''}番目`}</span>
          <h3>{entry.user_name}</h3>
        </div>
        <strong className="party-kp">パーティKP {entry.party_kp}</strong>
      </div>
      <div className="pokemon-grid">
        {entry.pokemon.map((pokemonName) => <PokemonChip key={pokemonName} name={pokemonName} />)}
      </div>
      {entry.note && <p className="entry-note">{entry.note}</p>}
    </article>
  );
}
