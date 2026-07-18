import { useState } from 'react';
import { usePokemonCatalog } from './PokemonCatalog';

export function PokemonChip({ name }: { name: string }) {
  const catalog = usePokemonCatalog();
  const pokemon = catalog[name];
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = pokemon?.image ? `${import.meta.env.BASE_URL}${pokemon.image}` : null;

  return (
    <span className="pokemon-chip" title={name}>
      {imageUrl && !imageFailed ? (
        <img src={imageUrl} alt="" onError={() => setImageFailed(true)} />
      ) : (
        <span className="pokemon-fallback" aria-hidden="true">{name.slice(0, 1)}</span>
      )}
      <span>{name}</span>
    </span>
  );
}
