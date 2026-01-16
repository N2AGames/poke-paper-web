import { Injectable } from '@angular/core';
import { CardInfo } from '../models/card-info.model';

const POKEMON_FELP_CARDS: CardInfo[] = [
  new CardInfo('/imgs/pokemons/agenda2030.png', 'Agenda 2030', false),
  new CardInfo('/imgs/pokemons/inaki.png', 'Iñaki', false),
  new CardInfo('/imgs/pokemons/krokocock.png', 'Krokocock', false),
  new CardInfo('/imgs/pokemons/larios_tonic.png', 'Larios Tonic', false),
  new CardInfo('/imgs/pokemons/sopa_de_ajo.png', 'Sopa de Ajo', false),
  new CardInfo('/imgs/pokemons/tomboy.png', 'Tomboy', false)
];

@Injectable({
  providedIn: 'root',
})
export class PokemonDataService {
  async getFelpCards(): Promise<CardInfo[]> {
    return new Promise((resolve) => {
        resolve(POKEMON_FELP_CARDS);
    });
  }
}
