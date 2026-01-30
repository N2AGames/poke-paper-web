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

@Injectable({
  providedIn: 'root',
})
export class PokemonDataService {
  private readonly pokemonApiUrl = 'https://pokeapi.co/api/v2/pokemon/';

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
    
    // Simple hash function using date string
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert hash to valid pokemon index (1 to GENERATION_LIMITS)
    const maxPokemon = GENERATION_LIMITS[LAST_GENERATION];
    const pokemonIndex = (Math.abs(hash) % maxPokemon) + 1;
    
    return pokemonIndex;
  }

  async getAllPokemonNames(): Promise<{ results: { name: string }[] }> {
    const response = await fetch(`${this.pokemonApiUrl}?limit=${GENERATION_LIMITS[LAST_GENERATION]}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Pokemon names');
    }
    return await response.json();
  }
}