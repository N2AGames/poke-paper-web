import { Component } from '@angular/core';
import { FlipCard } from "../../../shared/components/flip-card/flip-card";

@Component({
  selector: 'app-felp-cards-hub',
  imports: [FlipCard],
  templateUrl: './felp-cards-hub.html',
  styleUrl: './felp-cards-hub.css',
})
export class FelpCardsHub {

  card1 = {
    imgSrc: '/imgs/pokemons/agenda2030.png',
    title: 'Agenda 2030'
  };

}
