import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PokemonDefinition } from '../types/api';

const PokemonCatalogContext = createContext<Record<string, PokemonDefinition>>({});

export function PokemonCatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<PokemonDefinition[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/pokemon.json`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data: PokemonDefinition[]) => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => setCatalog([]));
  }, []);

  const byName = useMemo(
    () => Object.fromEntries(catalog.map((pokemon) => [pokemon.name, pokemon])),
    [catalog],
  );

  return <PokemonCatalogContext.Provider value={byName}>{children}</PokemonCatalogContext.Provider>;
}

export function usePokemonCatalog() {
  return useContext(PokemonCatalogContext);
}
