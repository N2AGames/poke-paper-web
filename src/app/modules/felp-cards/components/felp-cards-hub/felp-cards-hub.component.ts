import { Component, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { FlipCard } from "../../../shared/components/flip-card/flip-card.component";
import { CardInfo } from '../../../shared/models/card-info.model';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-felp-cards-hub',
  imports: [CommonModule, FlipCard],
  templateUrl: './felp-cards-hub.component.html',
  styleUrl: './felp-cards-hub.component.css',
})
export class FelpCardsHub implements AfterViewInit {
  @ViewChildren(FlipCard) cardComponents!: QueryList<FlipCard>;

  pokemonCards: CardInfo[] = [];

  constructor(private pokemonDataService: PokemonDataService) { 
    this.loadPokemonCards();
  }

  ngAfterViewInit() {
    // Esperar a que los componentes estén listos
    setTimeout(() => {
      this.initializeFlipLoop();
      setInterval(() => this.initializeFlipLoop(), 12000);
    }, 100);
  }

  loadPokemonCards() {
    this.pokemonDataService.getFelpCards().then(cards => {
      this.pokemonCards = cards;
    });
  }

  initializeFlipLoop() {
    const cards = this.cardComponents.toArray();
    
    // Primero voltear todas al reverso
    cards.forEach(card => card.unflip());
    
    // Luego voltear cada carta en secuencia
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.flip();
        console.log(`Carta ${index} volteada`);
      }, index * 500);
    });
    
    // Después de voltearlas todas, volver al reverso
    const totalTime = cards.length * 500;
    setTimeout(() => {
      cards.forEach(card => card.unflip());
      console.log('Todas las cartas vueltas al reverso');
    }, totalTime + 2000);
  }
}