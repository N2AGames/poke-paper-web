import { Component, OnInit, ViewChild } from '@angular/core';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { FlipCard } from "../../../shared/components/flip-card/flip-card.component";
import { CardInfo } from '../../../shared/models/card-info.model';
import { PokemonApiResponse } from '../../../shared/models/pokemon-api.model';
import { InputAuto } from '../../../shared/components/input-auto/input-auto.component';

@Component({
  selector: 'app-who-is-that-poke',
  imports: [FlipCard, InputAuto],
  templateUrl: './who-is-that-poke.component.html',
  styleUrl: './who-is-that-poke.component.css',
})
export class WhoIsThatPoke implements OnInit {

  @ViewChild(FlipCard) flipCardComponent!: FlipCard;
  @ViewChild(InputAuto) inputAutoComponent!: InputAuto;

  pokeInfo: CardInfo = new CardInfo();
  pokeNames: string[] = [];

  constructor(
    private readonly pokemonDataService: PokemonDataService
  ) {
    this.loadData();
  }

  async loadData() {
    try {
      console.log('Starting to load data...');
      
      const [pokemonData, allNamesData] = await Promise.all([
        this.pokemonDataService.getPokemonDataRandom(),
        this.pokemonDataService.getAllPokemonNames()
      ]);
      
      this.pokeInfo = this.parseFromPokemonData(pokemonData);
      this.pokeNames = allNamesData.results.map((entry: any) => entry.name);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
