import { Component, Input, OnInit, signal, Inject, PLATFORM_ID, CreateSignalOptions, WritableSignal, computed, ViewChild, ElementRef } from '@angular/core';
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
  styleUrls: ['./flip-card.component.css']
})
export class FlipCard implements OnInit {
  @Input() size: string = '10vw';
  @Input() pokePorcentaje: number = 80;
  @Input() showPokeName: boolean = true;
  @Input() autoLoad: boolean = false;
  @Input() selectedMode: string = '1gen';
  @Input() doubleTrouble: boolean = false;
  @Input() cardText: string = '';
  @Input() pokemonNames: string[] = [];
  
  pokemonAmount: number = 1;

  isShadowed: WritableSignal<boolean>[] = new Array<WritableSignal<boolean>>();;
  isFlipped = signal(false);
  isRevealing = signal(false);
  isFullyRevealed = signal(false);
  cardInfo: CardInfo = new CardInfo();

  fondoCarta: string = 'imgs/fondo_carta.png';
  @ViewChild('fondoCartaImg') fondoCartaImg?: ElementRef<HTMLImageElement>;

  constructor(
    private readonly pokemonDataService: PokemonDataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    console.log(this.pokemonNames);
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
        Array.from({ length: amount }, (_, index) => this.getPokemonDataByMode(this.selectedMode, index))
      );
      this.cardInfo = this.parseFromPokemonData(pokemonDataList);
      this.initShadowSignals(this.cardInfo.imgsSrc.length);
      this.isFlipped.set(true);
      this.isFullyRevealed.set(false);
      this.isShadowed.forEach(signal => signal.set(true));
      this.tintCardBackground();
    } catch (error) {
      console.error('Error fetching pokemon data:', error);
    }
  }

  async getPokemonDataByMode(selectedMode: string, index: number): Promise<PokemonApiResponse> {
    if(selectedMode === '1gen') {
      return this.pokemonDataService.getPokemonDataRandom(1);
    } else if (selectedMode === 'classics') {
      return this.pokemonDataService.getPokemonDataRandom(3);
    } else if (selectedMode === 'all') {
      return this.pokemonDataService.getPokemonDataRandom(9);
    } else if (selectedMode === 'daily') {
      return this.pokemonDataService.getDailyPokemonData();
    } else if (selectedMode === 'manual' && this.pokemonNames) {
      return this.pokemonDataService.getPokemonData(this.pokemonNames[index]);
    } else {
      throw new Error('Invalid mode selected');
    }
  }

  parseFromPokemonData(data: PokemonApiResponse[]): CardInfo {
    return {
      title: this.cardText ? this.cardText : data.map(p => p.name).join(' + '),
      imgsSrc: data.map(p => p.sprites.front_default),
      criesUrl: data.map(p => p.cries.legacy ? p.cries.legacy : p.cries.latest),
      colors: this.parseColorsFromData(data),
      pokeData: data,
      flipped: true,
      shadowed: Array(data.length).fill(true)
    };
  }

  parseColorsFromData(data: PokemonApiResponse[]): string[] {
    let colors: string[] = [];
    for(let i = 0; i < data.length; i++) {
      const color1 = Utils.getPastelColorByType(data[i].types[0].type.name, 0.68);
      const color2 = data[i].types[1] ? Utils.getPastelColorByType(data[i].types[1].type.name, 0.68) : color1;
      colors.push(color1);
      colors.push(color2);
    }
    if(colors.length == 2) {
      colors.push(colors[0]);
      colors.push(colors[1]);
    }
    return colors;
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
      // Check if all shadows are removed
      if (this.checkAllShadowsRemoved()) {
        this.isFullyRevealed.set(true);
      }
      this.launchCry(i);
    }, 1000);
  }

  unshadowAll() {
    this.isRevealing.set(true);
    this.cardInfo.shadowed.fill(false);
    setTimeout(() => {
      this.isShadowed.forEach(signal => signal.set(false));
      this.isRevealing.set(false);
      this.isFullyRevealed.set(true);
      this.launchCryAll();
    }, 1000);
  }
  
  checkAllShadowsRemoved() {
    return this.cardInfo.shadowed.every(shadow => !shadow);
  }

  launchCry(i: number = 0) {
      const audio = new Audio(this.cardInfo.criesUrl[i]);
      audio.volume = 0.2;
      audio.play();
  }

  launchCryAll() {
    for(let i = 0; i < this.cardInfo.criesUrl.length; i++) {
      const audio = new Audio(this.cardInfo.criesUrl[i]);
      audio.volume = 0.2;
      audio.play();
    }
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
      const fondoCartaElement = this.fondoCartaImg?.nativeElement;
      if (fondoCartaElement) {
        fondoCartaElement.src = 'imgs/fondo_carta.png';
      }
    }
  }

  tintCardBackground() {
    this.resetImage();
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const fondoCartaElement = this.fondoCartaImg?.nativeElement;
      if (fondoCartaElement) {
        // TODO Handle multiple colors
        Utils.tintImage(fondoCartaElement, this.cardInfo.colors);
      }
    }
  }
}
