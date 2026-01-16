import { Component, Input, signal } from '@angular/core';
import { CardInfo } from '../../models/card-info.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'flip-card',
  imports: [CommonModule],
  templateUrl: './flip-card.html',
  styleUrl: './flip-card.css'
})
export class FlipCard {
  @Input() cardInfo!: CardInfo;
  
  isFlipped = signal(false);

  flip() {
    this.isFlipped.set(true);
  }

  unflip() {
    this.isFlipped.set(false);
  }

  toggle() {
    this.isFlipped.update(value => !value);
  }
}
