import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { PokemonApiResponse } from '../../../shared/models/pokemon-api.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { InputAuto } from '../../../shared/components/input-auto/input-auto.component';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { CommonModule } from '@angular/common';

export interface PTBoard {
  requestsC: PTBoardRequest[];
  requestsR: PTBoardRequest[];
  guesses: PTBoardGuess[][];
}

export interface PTBoardRequest {
  text: string;
  isCompleted: boolean;
}

export interface PTBoardGuess {
  pokemon?: PokemonApiResponse;
  isCorrect: boolean;
}

@Component({
  selector: 'poke-table-board',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputAuto],
  templateUrl: './poke-table-board.component.html',
  styleUrls: ['./poke-table-board.component.css'],
})
export class PokeTableBoard implements OnInit{
  @ViewChild('pokeInput') pokeInput!: InputAuto;

  @Input() mode: string = 'daily';
  @Input() height: number = 3;
  @Input() width: number = 5;

  resultMessage: string = '';

  board: PTBoard;
  currentGuess: PTBoardGuess | undefined;
  pokeNames: string[] = [];

  constructor(
    private readonly pokemonDataService: PokemonDataService,
    private readonly cdr: ChangeDetectorRef
  ) {
    // Aquí se inicializaría el estado del tablero, posiblemente con datos de ejemplo o con datos reales si se conecta a un servicio.
    this.board = this.initializeBoard();
  }

  ngOnInit() {
    this.loadPokemonNames();
  }

  async loadPokemonNames() {
    const allNamesData = await this.pokemonDataService.getAllPokemonNames();
    this.pokeNames = allNamesData.results.map((entry: any) => entry.name);
  }

  initializeBoard(): PTBoard {
    let requestsR: PTBoardRequest[] = [];
    let requestsC: PTBoardRequest[] = [];
    let guesses: PTBoardGuess[][] = [];

    for (let i = 0; i < this.height; i++) {
      requestsR.push({ text: `Request R${i + 1}`, isCompleted: false });
    }
    for (let i = 0; i < this.width; i++) {
      requestsC.push({ text: `Request C${i + 1}`, isCompleted: false });
    }
    for (let i = 0; i < this.height; i++) {
      let row: PTBoardGuess[] = [];
      for (let j = 0; j < this.width; j++) {
        row.push({ pokemon: undefined, isCorrect: false });
      }
      guesses.push(row);
    }
    return { requestsC: requestsC, requestsR: requestsR, guesses };
  }

  checkForGuess(guess: PTBoardGuess) {
    if(guess.pokemon) {
      this.pokeInput.setValue(guess.pokemon.name);
    }
    this.currentGuess = guess;

    this.pokeInput.focus();
  }

  pokemonSelected(pokemon: string) {
    if (!this.currentGuess) {
      this.resultMessage = 'Por favor, selecciona una casilla para adivinar primero.';
      return;
    }
    this.pokemonDataService.getPokemonData(pokemon).then((data) => {
      if (data) {
        this.updateCurrentGuess(data);
        this.resultMessage = '';
      } else {
        this.resultMessage = `No se encontró información para el Pokémon "${pokemon}".`;
      }
      this.cdr.detectChanges();
    }).catch(() => {
      this.resultMessage = `No se encontró información para el Pokémon "${pokemon}".`;
      this.cdr.detectChanges();
    });
  }

  private updateCurrentGuess(pokemon: PokemonApiResponse): void {
    for (let rowIndex = 0; rowIndex < this.board.guesses.length; rowIndex++) {
      const columnIndex = this.board.guesses[rowIndex].findIndex((guess) => guess === this.currentGuess);

      if (columnIndex === -1) {
        continue;
      }

      const updatedGuess: PTBoardGuess = {
        ...this.board.guesses[rowIndex][columnIndex],
        pokemon,
      };

      const updatedRow = [...this.board.guesses[rowIndex]];
      updatedRow[columnIndex] = updatedGuess;

      const updatedGuesses = [...this.board.guesses];
      updatedGuesses[rowIndex] = updatedRow;

      this.board = {
        ...this.board,
        guesses: updatedGuesses,
      };
      this.currentGuess = updatedGuess;
      return;
    }

    this.currentGuess = {
      isCorrect: this.currentGuess?.isCorrect ?? false,
      ...this.currentGuess,
      pokemon,
    };
  }

  isGameFinished(): boolean {
    // Aquí iría la lógica para determinar si el juego ha terminado o no, dependiendo del estado del tablero.
    // Por ahora, simplemente devuelve false como un marcador de posición.
    return false;
  }
  
}
