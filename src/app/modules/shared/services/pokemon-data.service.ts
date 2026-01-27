import { Injectable } from '@angular/core';
import { PokemonApiResponse } from '../models/pokemon-api.model';

const MAX_POKEMON_ID = 898; // Total number of Pokémons in the API
const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon/';

@Injectable({
  providedIn: 'root',
})
export class PokemonDataService {

  async getPokemonData(pokemonName: string): Promise<PokemonApiResponse> {
    const response = await fetch(`${POKEMON_API_URL}${pokemonName.toLowerCase()}`);
    if (!response.ok) {
      throw new Error('Pokemon not found');
    }
    return await response.json();
  }

  async getPokemonDataRandom(): Promise<PokemonApiResponse> {
    const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1; // There are 898 Pokemons in the API
    const response = await fetch(`${POKEMON_API_URL}${randomId}`);
    if (!response.ok) {
      throw new Error('Pokemon not found');
    }
    return await response.json();
  }

  async getRandomPokemons(pokeAmount: number): Promise<PokemonApiResponse[]> {
    const promises: Promise<PokemonApiResponse>[] = [];
    for (let i = 0; i < pokeAmount; i++) {
      promises.push(this.getPokemonDataRandom());
    }
    return await Promise.all(promises);
  }

  async getAllPokemonNames(): Promise<{ results: { name: string }[] }> {
    const response = await fetch(`${POKEMON_API_URL}?limit=${MAX_POKEMON_ID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Pokemon names');
    }
    return await response.json();
  }
}
