import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, PLATFORM_ID, Inject, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { FlipCard } from "../../../shared/components/flip-card/flip-card.component";
import { InputAuto } from '../../../shared/components/input-auto/input-auto.component';
import { FormsModule } from '@angular/forms';
import { Score } from "../../../shared/components/score/score.component";
import { Router } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-who-is-that-poke',
  imports: [FlipCard, InputAuto, CommonModule, FormsModule, Score, MatIconModule],
  templateUrl: './who-is-that-poke.component.html',
  styleUrls: ['./who-is-that-poke.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WhoIsThatPoke implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(FlipCard) flipCardComponent!: FlipCard;
  @ViewChild(InputAuto) inputAutoComponent!: InputAuto;
  @ViewChild(Score) scoreComponent!: Score;

  selectedMode: string = '1gen';
  modeSelected: boolean = false;
  isDoubleTrouble: boolean = false;

  pokeNames: string[] = [];
  resultMessage: string = '';
  isResultVisible: boolean = false;
  noGuess: boolean = true;
  cardSize: string = '15vw';
  cardSizeInfo: string = '10vw';

  openInstructions: boolean = false;
  openScore: boolean = false;
  showScore: boolean = false;

  scoreEventMode: string = '';
  scoreEventType: 'success' | 'failure' | '' = '';
  scoreEventTick: number = 0;
  dailyCompletedToday: boolean = false;

  private resizeListener: () => void;
  private isBrowser: boolean;

  constructor(
    private readonly pokemonDataService: PokemonDataService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private readonly router: Router
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
      this.cardSize = '12vw';
      this.cardSizeInfo = '10vw';
      return;
    }

    const width = window.innerWidth;
    let size = '9.5vw';
    let infoSize = '10vw';
    if (width < 400) {
      size = '60vw';
      infoSize = '40vw';
    } else if (width < 600) {
      size = '40vw';
      infoSize = '30vw';
    } else if (width < 800) {
      size = '30vw';
      infoSize = '20vw';
    } else if (width < 1000) {
      size = '12vw';
      infoSize = '10vw';
    }

    this.cardSize = size;
    this.cardSizeInfo = infoSize;
  }

  ngOnInit(): void {
    this.setCardSize();
    this.dailyCompletedToday = this.getDailyCompleteFromStorage();
    if (this.isBrowser) {
      window.addEventListener('resize', this.resizeListener);
    }
    // Cargar datos en el siguiente ciclo para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.loadData(), 0);
  }

  ngAfterViewInit(): void {
    this.dailyCompletedToday = this.isDailyComplete();
    this.cdr.markForCheck();
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
      this.openScore = true;
      this.triggerScoreEvent('failure', this.selectedMode + (this.isDoubleTrouble ? '-DT' : ''));
    } else if (this.isDoubleTrouble) {
        this.flipCardComponent.unshadow(indexOfCorrect);
        if(this.flipCardComponent.checkAllShadowsRemoved()) {
          this.resultMessage = "Correct! You found all: " + pokeInfo.title + "!";
          this.isResultVisible = true;
          this.openScore = true;
          this.triggerScoreEvent('success', this.selectedMode + '-DT');
        } else {
          this.resultMessage = "Correct! You found " + pokeInfo.pokeData[indexOfCorrect].name + "! Keep going!";
          this.noGuess = true;
        }
    } else {
      this.resultMessage = "Correct! It was " + pokeInfo.title + "!";
      this.flipCardComponent.unshadowAll();
      this.isResultVisible = true;
      this.openScore = true;
      this.triggerScoreEvent('success', this.selectedMode);
    }
    this.cdr.markForCheck();
    this.inputAutoComponent.clearInput();
  }

  skipGuess() {
    const pokeInfo = this.flipCardComponent.getPokemonInfo();
    this.resultMessage = "Skipped! It was " + pokeInfo.title + ".";
    this.flipCardComponent.unshadowAll();
    this.isResultVisible = true;
    this.openScore = true;
    this.triggerScoreEvent('failure', this.selectedMode);
    this.cdr.markForCheck();
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
    this.openScore = false;
  }

  selectMode(mode: string) {
    this.selectedMode = mode;
    this.modeSelected = true;
    this.resetPokemon();
    this.showScore = true;
  }

  changeMode() {
    this.modeSelected = false;
    this.showScore = false;
    this.resetPokemon(false);
  }

  pokemonSelected($event: string) {
    this.noGuess = !$event || $event.trim() === '';
  }

  toggleDoubleTrouble() {
    this.isDoubleTrouble = !this.isDoubleTrouble;
    this.setCardSize();
    console.log('isDoubleTrouble:', this.isDoubleTrouble);
    this.cdr.markForCheck();
  }

  private triggerScoreEvent(type: 'success' | 'failure', mode: string) {
    this.scoreEventType = type;
    this.scoreEventMode = mode;
    this.scoreEventTick += 1;
  }

  isDailyComplete(): boolean {
    if (!this.scoreComponent) return this.dailyCompletedToday;
    const today = this.getDateKey(new Date());
    const completed = this.scoreComponent.gameInfo.dailyMap.has(today);
    this.dailyCompletedToday = completed;
    return completed;
  }

  private getDailyCompleteFromStorage(): boolean {
    if (!this.isBrowser) return false;
    try {
      const gameInfoRaw = localStorage.getItem('who-is-that-poke-game-info');
      if (!gameInfoRaw) return false;
      const gameInfo = JSON.parse(gameInfoRaw);
      const today = this.getDateKey(new Date());
      return Boolean(gameInfo?.dailyMap?.[today]);
    } catch {
      return false;
    }
  }

  private getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return(): void {
    if (this.isBrowser) {
      this.router.navigate(['/main']);
    }
  }
}
