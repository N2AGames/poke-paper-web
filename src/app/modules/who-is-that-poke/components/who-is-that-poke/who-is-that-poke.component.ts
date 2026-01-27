import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { FlipCard } from "../../../shared/components/flip-card/flip-card.component";
import { InputAuto } from '../../../shared/components/input-auto/input-auto.component';

@Component({
  selector: 'app-who-is-that-poke',
  imports: [FlipCard, InputAuto],
  templateUrl: './who-is-that-poke.component.html',
  styleUrls: ['./who-is-that-poke.component.css', '../../../../../styles.css']
})
export class WhoIsThatPoke implements OnInit, OnDestroy {

  @ViewChild(FlipCard) flipCardComponent!: FlipCard;
  @ViewChild(InputAuto) inputAutoComponent!: InputAuto;

  pokeNames: string[] = [];
  resultMessage: string = '';
  isResultVisible: boolean = false;
  cardSize: string = '15vw';
  private resizeListener: () => void;
  private isBrowser: boolean;

  constructor(
    private readonly pokemonDataService: PokemonDataService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.resizeListener = () => this.setCardSize();
  }

  async loadData() {
    try {
      console.log('Starting to load data...');
      
      const allNamesData = await this.pokemonDataService.getAllPokemonNames();
      this.pokeNames = allNamesData.results.map((entry: any) => entry.name);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  setCardSize() {
    if (!this.isBrowser) {
      this.cardSize = '15vw';
      return;
    }

    const width = window.innerWidth;
    let size = '15vw';
    if (width < 400) {
      size = '60vw';
    } else if (width < 600) {
      size = '40vw';
    } else if (width < 800) {
      size = '30vw';
    } else if (width < 1000) {
      size = '20vw';
    }
    this.cardSize = size;
  }

  ngOnInit(): void {
    this.loadData();
    this.setCardSize();
    if (this.isBrowser) {
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  submitGuess() {
    const userGuess = this.inputAutoComponent.getInputValue().toLowerCase();
    const pokeInfo = this.flipCardComponent.getPokemonInfo();
    const correctName = pokeInfo.title.toLowerCase();
    if (userGuess === correctName) {
      this.resultMessage = "Correct! It's " + pokeInfo.title + "!";
    } else {
      this.resultMessage = "Wrong! It was " + pokeInfo.title + ".";
    }
    this.flipCardComponent.unshadow();
    this.isResultVisible = true;
  }

  skipGuess() {
    const pokeInfo = this.flipCardComponent.getPokemonInfo();
    this.resultMessage = "Skipped! It was " + pokeInfo.title + ".";
    this.flipCardComponent.unshadow();
    this.isResultVisible = true;
  }

  resetPokemon() {
    this.flipCardComponent.unflip();
    this.resultMessage = '';
    this.isResultVisible = false;
    this.inputAutoComponent.clearInput();
    this.flipCardComponent.loadPokemon();
  }
}
