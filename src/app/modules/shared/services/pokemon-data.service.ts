import { Injectable } from '@angular/core';
import { CardInfo } from '../models/card-info.model';
import { PokemonApiResponse } from '../models/pokemon-api.model';

const POKEMON_FELP_CARDS: CardInfo[] = [
  new CardInfo('/imgs/pokemons/agenda2030.png', 'Agenda 2030', false),
  new CardInfo('/imgs/pokemons/inaki.png', 'Iñaki', false),
  new CardInfo('/imgs/pokemons/krokocock.png', 'Krokocock', false),
  new CardInfo('/imgs/pokemons/larios_tonic.png', 'Larios Tonic', false),
  new CardInfo('/imgs/pokemons/sopa_de_ajo.png', 'Sopa de Ajo', false),
  new CardInfo('/imgs/pokemons/tomboy.png', 'Tomboy', false)
];

const MAX_POKEMON_ID = 898; // Total number of Pokémons in the API
const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon/';

@Injectable({
  providedIn: 'root',
})
export class PokemonDataService {
  async getFelpCards(): Promise<CardInfo[]> {
    return new Promise((resolve) => {
        resolve(POKEMON_FELP_CARDS);
    });
  }

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

  async getAllPokemonNames() {
    const response = await fetch(`${POKEMON_API_URL}?limit=${MAX_POKEMON_ID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Pokemon names');
    }
    return await response.json();
  }
}
