import { Component, OnInit, ViewChild } from '@angular/core';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { FlipCard } from "../../../shared/components/flip-card/flip-card.component";
import { CardInfo } from '../../../shared/models/card-info.model';
import { parse } from 'path';
import { PokemonApiResponse } from '../../../shared/models/pokemon-api.model';

@Component({
  selector: 'app-who-is-that-poke',
  imports: [FlipCard],
  templateUrl: './who-is-that-poke.component.html',
  styleUrl: './who-is-that-poke.component.css',
})
export class WhoIsThatPoke implements OnInit {

  @ViewChild(FlipCard) flipCardComponent!: FlipCard;

  pokeInfo: CardInfo = new CardInfo();

  constructor(
    private readonly pokemonDataService: PokemonDataService
  ) {
    this.loadPokemonData('pikachu');
  }

  loadPokemonData(pokemonName: string) {
    this.pokemonDataService.getPokemonData(pokemonName).then(data => {
      this.pokeInfo = this.parseFromPokemonData(data);
      this.flipCardComponent.cardInfo = this.pokeInfo;
      this.flipCardComponent.flip();
    }).catch(error => {
      console.error('Error fetching Pokemon data:', error);
    });
  }

  parseFromPokemonData(data: PokemonApiResponse): CardInfo {
    return {
      title: data.name,
      imgSrc: data.sprites.front_default,
      flipped: false
    };
  }

  ngOnInit(): void {

  }
}
