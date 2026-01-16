import { Component } from '@angular/core';
import { FlipCard } from "../../../shared/components/flip-card/flip-card";
import { CardInfo } from '../../../shared/models/card-info.model';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-felp-cards-hub',
  imports: [CommonModule, FlipCard],
  templateUrl: './felp-cards-hub.html',
  styleUrl: './felp-cards-hub.css',
})
export class FelpCardsHub {

  pokemonCards: CardInfo[] = [];

  constructor(private pokemonDataService: PokemonDataService) { 
    this.loadPokemonCards();
  }

  loadPokemonCards() {
    this.pokemonDataService.getFelpCards().then(cards => {
      this.pokemonCards = cards;
    });
  }
}
