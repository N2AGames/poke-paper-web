import { Component, Input, OnChanges, OnInit, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CardInfo } from '../../models/card-info.model';
import { CommonModule } from '@angular/common';
import { PokemonDataService } from '../../services/pokemon-data.service';
import { PokemonApiResponse } from '../../models/pokemon-api.model';
import { Utils } from '../../utils';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'flip-card',
  imports: [CommonModule],
  templateUrl: './flip-card.component.html',
  styleUrls: ['./flip-card.component.css', '../../../../../styles.css']
})
export class FlipCard implements OnInit {
  @Input() size: string = '10vw';
  @Input() pokePorcentaje: number = 80;
  @Input() showPokeName: boolean = true;
  @Input() autoLoad: boolean = false;
  @Input() selectedMode: number = 9;

  isShadowed = signal(true);
  isFlipped = signal(false);
  isRevealing = signal(false);
  cardInfo: CardInfo = new CardInfo();

  fondoCarta: string = 'imgs/fondo_carta.png';

  constructor(
    private readonly pokemonDataService: PokemonDataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (this.autoLoad) {
      this.loadPokemon(this.selectedMode);
    }
  }

  async loadPokemon(selectedMode: number): Promise<void> {
    this.selectedMode = selectedMode;
    try {
      console.log('Loading pokemon data...');
      const pokemonData = await this.pokemonDataService.getPokemonDataRandom(this.selectedMode);
      this.cardInfo = this.parseFromPokemonData(pokemonData);
      this.isFlipped.set(true);
      this.isShadowed.set(true);
      this.tintCardBackground();
    } catch (error) {
      console.error('Error fetching pokemon data:', error);
    }
  }

  parseFromPokemonData(data: PokemonApiResponse): CardInfo {
    return {
      title: data.name,
      imgSrc: data.sprites.front_default,
      cryUrl: data.cries.legacy ? data.cries.legacy : data.cries.latest,
      color: data.types.length > 0 ? Utils.getColorByType(data.types[0].type.name) : '#FFFFFF',
      flipped: true
    };
  }

  getPokemonInfo(): CardInfo {
    return this.cardInfo;
  }

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

  shadow() {
    this.isShadowed.set(true);
  }

  unshadow() {
    this.isRevealing.set(true);
    setTimeout(() => {
      this.isShadowed.set(false);
      this.isRevealing.set(false);
      this.launchCry();
    }, 1000);
  }

  launchCry() {
    new Audio(this.cardInfo.cryUrl).play();
  }

  togleShadow() {
    if (this.isShadowed()) {
      this.unshadow();
    } else {
      this.shadow();
    }
  }

  resetImage() {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const fondoCartaElement = document.getElementById('fondo-carta') as HTMLImageElement;
      if (fondoCartaElement) {
        fondoCartaElement.src = 'imgs/fondo_carta.png';
      }
    }
  }

  tintCardBackground() {
    this.resetImage();
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const fondoCartaElement = document.getElementById('fondo-carta') as HTMLImageElement;
      if (fondoCartaElement) {
        Utils.tintImage(fondoCartaElement, this.cardInfo.color);
      }
    }
  }
}
