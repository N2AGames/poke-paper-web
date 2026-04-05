import { Injectable } from '@angular/core';
import { PokemonApiResponse } from '../models/pokemon-api.model';

const GENERATION_LIMITS: { [key: number]: number } = {
  1: 151,
  2: 251,
  3: 386,
  4: 493,
  5: 649,
  6: 721,
  7: 809,
  8: 905,
  9: 1025
};

const LAST_GENERATION = 9;

interface TypeListResponse {
  results: Array<{
    name: string;
    url: string;
  }>;
}

interface NameListResponse {
  results: Array<{
    name: string;
    url: string;
  }>;
}

interface TypePokemonResponse {
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
  }>;
}

interface GenerationResponse {
  pokemon_species: Array<{
    name: string;
    url: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class PokemonDataService {
  private readonly pokemonApiUrl = 'https://pokeapi.co/api/v2/pokemon/';
  private readonly typeApiUrl = 'https://pokeapi.co/api/v2/type/';
  private readonly generationApiUrl = 'https://pokeapi.co/api/v2/generation/';
  private readonly typePokemonCache = new Map<string, string[]>();
  private readonly generationPokemonCache = new Map<number, string[]>();

  async getPokemonData(pokemonName: string): Promise<PokemonApiResponse> {
    const response = await fetch(`${this.pokemonApiUrl}${pokemonName.toLowerCase()}`);
    if (!response.ok) {
      throw new Error('Pokemon not found');
    }
    return await response.json();
  }

  async getPokemonDataRandom(selectedMode: number): Promise<PokemonApiResponse> {
    const randomId = Math.floor(Math.random() * GENERATION_LIMITS[selectedMode]) + 1;
    const response = await fetch(`${this.pokemonApiUrl}${randomId}`);
    if (!response.ok) {
      throw new Error('Pokemon not found');
    }
    return await response.json();
  }

  async getRandomPokemons(pokeAmount: number): Promise<PokemonApiResponse[]> {
    const promises: Promise<PokemonApiResponse>[] = [];
    for (let i = 0; i < pokeAmount; i++) {
      promises.push(this.getPokemonDataRandom(LAST_GENERATION));
    }
    return await Promise.all(promises);
  }

  async getDailyPokemonData(): Promise<PokemonApiResponse> {
    const actualDate = new Date();
    // Generate consistent daily index based on date (YYYY-MM-DD)
    const dailyIndex = this.getDailyPokemonIndex(actualDate);
    const response = await fetch(`${this.pokemonApiUrl}${dailyIndex}`);
    if (!response.ok) {
      throw new Error('Pokemon not found');
    }
    return await response.json();
  }

  private getDailyPokemonIndex(date: Date): number {
    // Format date as YYYY-MM-DD to ensure consistency across timezones
    const dateString = date.toISOString().split('T')[0];
    
    // Improved hash function with better randomization
    // Uses multiple rounds and mixing operations to avoid sequential patterns
    let hash = 0;
    
    // Initial hash with better distribution
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Apply additional mixing operations to improve randomization
    hash = hash ^ (hash >>> 16);
    hash = (hash * 2654435761) | 0;
    hash = hash ^ (hash >>> 15);
    hash = (hash * 2246822519) | 0;
    hash = hash ^ (hash >>> 13);
    
    // Convert hash to valid pokemon index (1 to GENERATION_LIMITS)
    const maxPokemon = GENERATION_LIMITS[LAST_GENERATION];
    const pokemonIndex = (Math.abs(hash) % maxPokemon) + 1;
    
    return pokemonIndex;
  }

  async getAllPokemonNames(): Promise<{ results: { name: string }[] }> {
    const [pokemonResponse, formsResponse] = await Promise.all([
      fetch(`${this.pokemonApiUrl}?limit=2000`),
      fetch('https://pokeapi.co/api/v2/pokemon-form?limit=2000'),
    ]);

    if (!pokemonResponse.ok || !formsResponse.ok) {
      throw new Error('Failed to fetch Pokemon names');
    }

    const [pokemonData, formsData] = await Promise.all([
      pokemonResponse.json() as Promise<NameListResponse>,
      formsResponse.json() as Promise<NameListResponse>,
    ]);

    const uniqueNames = new Set<string>([
      ...pokemonData.results.map((entry) => entry.name),
      ...formsData.results.map((entry) => entry.name),
    ]);

    return {
      results: Array.from(uniqueNames).sort().map((name) => ({ name })),
    };
  }
  
  async getTypes(): Promise<string[]> {
    const typesResponse = await fetch(this.typeApiUrl);
    if (!typesResponse.ok) {
      throw new Error('Failed to fetch Pokemon types');
    }

    const data = await typesResponse.json() as TypeListResponse;
    return data.results.map((type) => type.name);
  }

  async getPokemonNamesByType(typeName: string): Promise<string[]> {
    const normalizedType = typeName.toLowerCase();

    if (this.typePokemonCache.has(normalizedType)) {
      return this.typePokemonCache.get(normalizedType)!;
    }

    const response = await fetch(`${this.typeApiUrl}${normalizedType}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon for type "${typeName}"`);
    }

    const data = await response.json() as TypePokemonResponse;
    const pokemonNames = data.pokemon.map((entry) => entry.pokemon.name);
    this.typePokemonCache.set(normalizedType, pokemonNames);

    return pokemonNames;
  }

  async getPokemonNamesByGeneration(gen: number): Promise<string[]> {
    if (this.generationPokemonCache.has(gen)) {
      return this.generationPokemonCache.get(gen)!;
    }

    const response = await fetch(`${this.generationApiUrl}${gen}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon for generation ${gen}`);
    }

    const data = await response.json() as GenerationResponse;
    const names = data.pokemon_species.map((entry) => entry.name);
    this.generationPokemonCache.set(gen, names);
    return names;
  }
}