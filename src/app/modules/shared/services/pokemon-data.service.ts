import { Injectable } from '@angular/core';
import { CardInfo } from '../models/card-info.model';

const POKEMON_FELP_CARDS: CardInfo[] = [
  {
    imgSrc: '/imgs/pokemons/agenda2030.png',
    title: 'Agenda 2030',
    flipped: false
  }
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
