import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, PLATFORM_ID, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { FlipCard } from "../../../shared/components/flip-card/flip-card.component";
import { InputAuto } from '../../../shared/components/input-auto/input-auto.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-who-is-that-poke',
  imports: [FlipCard, InputAuto, CommonModule, FormsModule],
  templateUrl: './who-is-that-poke.component.html',
  styleUrls: ['./who-is-that-poke.component.css', '../../../../app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WhoIsThatPoke implements OnInit, OnDestroy {

  @ViewChild(FlipCard) flipCardComponent!: FlipCard;
  @ViewChild(InputAuto) inputAutoComponent!: InputAuto;

  selectedMode: string = '1gen';
  modeSelected: boolean = false;
  isDoubleTrouble: boolean = false;

  pokeNames: string[] = [];
  resultMessage: string = '';
  isResultVisible: boolean = false;
  noGuess: boolean = true;
  cardSize: string = '15vw';

  private resizeListener: () => void;
  private isBrowser: boolean;

  constructor(
    private readonly pokemonDataService: PokemonDataService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.resizeListener = () => this.setCardSize();
  }

  async loadData() {
    try {
      console.log('Starting to load data...');
      
      const allNamesData = await this.pokemonDataService.getAllPokemonNames();
      this.pokeNames = allNamesData.results.map((entry: any) => entry.name);
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
    this.setCardSize();
    if (this.isBrowser) {
      window.addEventListener('resize', this.resizeListener);
    }
    // Cargar datos en el siguiente ciclo para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.loadData(), 0);
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  submitGuess() {
    const userGuess = this.inputAutoComponent.getInputValue().toLowerCase();
    const pokeInfo = this.flipCardComponent.getPokemonInfo();
    const correctNames = pokeInfo.title.toLowerCase().split(' + ');
    const indexOfCorrect = correctNames.findIndex(name => name === userGuess);
    if (indexOfCorrect == -1) {
      this.resultMessage = "Wrong! It was " + pokeInfo.title + ".";
      this.flipCardComponent.unshadowAll();
      this.isResultVisible = true;
    } else if (this.isDoubleTrouble) {
        this.flipCardComponent.unshadow(indexOfCorrect);
        if(this.flipCardComponent.checkAllShadowsRemoved()) {
          this.resultMessage = "Correct! You found all: " + pokeInfo.title + "!";
          this.isResultVisible = true;
        } else {
          this.resultMessage = "Correct! You found " + pokeInfo.pokeData[indexOfCorrect].name + "! Keep going!";
        }
    } else {
      this.resultMessage = "Correct! It was " + pokeInfo.title + "!";
      this.flipCardComponent.unshadowAll();
      this.isResultVisible = true;
    }
    this.inputAutoComponent.clearInput();
  }

  skipGuess() {
    const pokeInfo = this.flipCardComponent.getPokemonInfo();
    this.resultMessage = "Skipped! It was " + pokeInfo.title + ".";
    this.flipCardComponent.unshadowAll();
    this.isResultVisible = true;
  }

  resetPokemon(loadNew: boolean = true) {
    if (!this.flipCardComponent) return;
    
    this.flipCardComponent.unflip();
    this.resultMessage = '';
    this.isResultVisible = false;
    this.inputAutoComponent.clearInput();
    if (loadNew) {
      this.flipCardComponent.loadPokemon(this.selectedMode);
    }
  }

  selectMode(mode: string) {
    this.selectedMode = mode;
    this.modeSelected = true;
    this.resetPokemon();
  }

  changeMode() {
    this.modeSelected = false;
    this.resetPokemon(false);
  }

  pokemonSelected($event: string) {
    this.noGuess = !$event || $event.trim() === '';
  }

  toggleDoubleTrouble() {
    this.isDoubleTrouble = !this.isDoubleTrouble;
    console.log('isDoubleTrouble:', this.isDoubleTrouble);
    this.cdr.markForCheck();
  }
}
