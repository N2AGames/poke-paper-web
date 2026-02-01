import { Component, Input, OnInit, signal, Inject, PLATFORM_ID, CreateSignalOptions, WritableSignal, computed } from '@angular/core';
import { CardInfo } from '../../models/card-info.model';
import { CommonModule } from '@angular/common';
import { PokemonDataService } from '../../services/pokemon-data.service';
import { PokemonApiResponse } from '../../models/pokemon-api.model';
import { Utils } from '../../utils';
import { isPlatformBrowser } from '@angular/common';
import { sign } from 'crypto';

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
  @Input() selectedMode: string = '1gen';
  @Input() doubleTrouble: boolean = false;
  
  pokemonAmount: number = 1;

  isShadowed: WritableSignal<boolean>[] = new Array<WritableSignal<boolean>>();;
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

  async loadPokemon(selectedMode: string): Promise<void> {
    if(this.doubleTrouble) {
      this.pokemonAmount = 2;
    }
    this.selectedMode = selectedMode;
    try {
      console.log('Loading pokemon data...');
      const amount = Math.max(1, this.pokemonAmount || 1);
      const pokemonDataList = await Promise.all(
        Array.from({ length: amount }, () => this.getPokemonDataByMode(this.selectedMode))
      );
      this.cardInfo = this.parseFromPokemonData(pokemonDataList);
      this.initShadowSignals(this.cardInfo.imgsSrc.length);
      this.isFlipped.set(true);
      this.isShadowed.forEach(signal => signal.set(true));
      this.tintCardBackground();
    } catch (error) {
      console.error('Error fetching pokemon data:', error);
    }
  }

  async getPokemonDataByMode(selectedMode: string): Promise<PokemonApiResponse> {
    if(selectedMode === '1gen') {
      return this.pokemonDataService.getPokemonDataRandom(1);
    } else if (selectedMode === 'classics') {
      return this.pokemonDataService.getPokemonDataRandom(3);
    } else if (selectedMode === 'all') {
      return this.pokemonDataService.getPokemonDataRandom(9);
    } else if (selectedMode === 'daily') {
      return this.pokemonDataService.getDailyPokemonData();
    } else {
      throw new Error('Invalid mode selected');
    }
  }

  parseFromPokemonData(data: PokemonApiResponse[]): CardInfo {
    return {
      title: data.map(p => p.name).join(' + '),
      imgsSrc: data.map(p => p.sprites.front_default),
      criesUrl: data.map(p => p.cries.legacy ? p.cries.legacy : p.cries.latest),
      colors: data.map(p => p.types.length > 0 ? Utils.getColorByType(p.types[0].type.name) : '#FFFFFF'),
      pokeData: data,
      flipped: true,
      shadowed: Array(data.length).fill(true)
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

  shadow(i: number = 0) {
    this.isShadowed[i].set(true);
  }

  unshadow(i: number = 0) {
    this.isRevealing.set(true);
    this.cardInfo.shadowed[i] = false;
    setTimeout(() => {
      this.isShadowed[i].set(false);
      this.isRevealing.set(false);
      this.launchCry();
    }, 1000);
  }

  unshadowAll() {
    this.isRevealing.set(true);
    this.cardInfo.shadowed.fill(false);
    setTimeout(() => {
      this.isShadowed.forEach(signal => signal.set(false));
      this.isRevealing.set(false);
      this.launchCry();
    }, 1000);
  }
  
  checkAllShadowsRemoved() {
    return this.cardInfo.shadowed.every(shadow => !shadow);
  }

  launchCry() {
    // TODO Handle multiple cries
    new Audio(this.cardInfo.criesUrl[0]).play();
  }

  togleShadow(i: number = 0) {
    if (this.isShadowed[i]()) {
      this.unshadow(i);
    } else {
      this.shadow(i);
    }
  }

  checkShadowed(i: number = 0): boolean {
    const shadowSignal = this.isShadowed[i];
    return shadowSignal ? shadowSignal() : true;
  }

  initShadowSignals(count: number) {
    this.isShadowed = Array.from({ length: count }, () => signal(true));
  }

  removeShadowAt(indexOfCorrect: number) {
    this.isShadowed[indexOfCorrect].set(false);
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
        // TODO Handle multiple colors
        Utils.tintImage(fondoCartaElement, this.cardInfo.colors[0]);
      }
    }
  }
}
