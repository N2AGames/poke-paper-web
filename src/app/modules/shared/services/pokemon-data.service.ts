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

  async getAllPokemonNames(): Promise<{ results: { name: string }[] }> {
    const response = await fetch(`${this.pokemonApiUrl}?limit=${GENERATION_LIMITS[LAST_GENERATION]}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Pokemon names');
    }
    return await response.json();
  }
}