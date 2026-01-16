import { Component, Input } from '@angular/core';
import { CardInfo } from '../../models/card-info.model';

@Component({
  selector: 'flip-card',
  imports: [],
  templateUrl: './flip-card.html',
  styleUrl: './flip-card.css',
})
export class FlipCard {

  @Input() cardInfo!: CardInfo;
}
