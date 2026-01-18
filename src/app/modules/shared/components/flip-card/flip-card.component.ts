import { Component, Input, signal } from '@angular/core';
import { CardInfo } from '../../models/card-info.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'flip-card',
  imports: [CommonModule],
  templateUrl: './flip-card.component.html',
  styleUrl: './flip-card.component.css'
})
export class FlipCard {
  @Input() cardInfo!: CardInfo;
  @Input() size: string = '10vw';
  @Input() pokePorcentaje: number = 80;
  @Input() showPokeName: boolean = true;
  
  isFlipped = signal(false);

  flip() {
    this.isFlipped.set(true);
  }

  unflip() {
    this.isFlipped.set(false);
  }

  public toggle() {
    console.log(this.cardInfo);
    this.isFlipped.update(value => !value);
  }
}
