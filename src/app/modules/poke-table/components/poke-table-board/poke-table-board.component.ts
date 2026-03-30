import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PokemonApiResponse } from '../../../shared/models/pokemon-api.model';
import { ReactiveFormsModule } from '@angular/forms';
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

  @Output() gameFinished = new EventEmitter<void>();

  resultMessage: string = '';

  board: PTBoard = { requestsC: [], requestsR: [], guesses: [] };
  currentGuess: PTBoardGuess | undefined;
  pokeNames: string[] = [];
  types: string[] = [];
  private readonly excludedTypes = new Set(['unknown', 'shadow']);
  private readonly maxBoardGenerationAttempts = 120;
  private typePokemonMap = new Map<string, Set<string>>();

  constructor(
    private readonly pokemonDataService: PokemonDataService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    try {
      await this.loadPokemonNames();
      await this.setupTypeData();
      this.board = this.initializeBoard();
      this.resultMessage = '';
    } catch {
      this.board = this.createEmptyBoard([], []);
      this.resultMessage = 'No se pudieron cargar los tipos para generar el tablero.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  async loadPokemonNames() {
    const allNamesData = await this.pokemonDataService.getAllPokemonNames();
    this.pokeNames = allNamesData.results.map((entry: any) => entry.name);
  }

  private async setupTypeData(): Promise<void> {
    const types = await this.pokemonDataService.getTypes();
    this.types = types.filter((type) => !this.excludedTypes.has(type));

    const typeEntries = await Promise.all(this.types.map(async (type) => {
      const pokemonNames = await this.pokemonDataService.getPokemonNamesByType(type);
      return [type, new Set(pokemonNames)] as const;
    }));

    this.typePokemonMap = new Map(typeEntries);
  }

  initializeBoard(): PTBoard {
    const boardTypes = this.selectCompatibleTypes();
    return this.createEmptyBoard(boardTypes.columnTypes, boardTypes.rowTypes);
  }

  private createEmptyBoard(columnTypes: string[], rowTypes: string[]): PTBoard {
    const requestsC = columnTypes.map((type) => ({ text: type, isCompleted: false }));
    const requestsR = rowTypes.map((type) => ({ text: type, isCompleted: false }));
    const guesses: PTBoardGuess[][] = [];

    for (let i = 0; i < this.height; i++) {
      const row: PTBoardGuess[] = [];
      for (let j = 0; j < this.width; j++) {
        row.push({ pokemon: undefined, isCorrect: false });
      }
      guesses.push(row);
    }

    return { requestsC, requestsR, guesses };
  }

  private selectCompatibleTypes(): { columnTypes: string[]; rowTypes: string[] } {
    if (this.types.length < this.width) {
      throw new Error('Not enough unique types to build board columns');
    }

    for (let attempt = 0; attempt < this.maxBoardGenerationAttempts; attempt++) {
      const columnTypes = this.pickUniqueRandomTypes(this.width);
      const compatibleRowTypes = this.types.filter((type) =>
        columnTypes.every((columnType) => this.hasTypeIntersection(type, columnType))
      );

      if (compatibleRowTypes.length >= this.height) {
        return {
          columnTypes,
          rowTypes: this.shuffle([...compatibleRowTypes]).slice(0, this.height),
        };
      }
    }

    throw new Error('Unable to generate a board with valid type combinations');
  }

  private hasTypeIntersection(firstType: string, secondType: string): boolean {
    const firstSet = this.typePokemonMap.get(firstType);
    const secondSet = this.typePokemonMap.get(secondType);

    if (!firstSet || !secondSet) {
      return false;
    }

    const smallerSet = firstSet.size <= secondSet.size ? firstSet : secondSet;
    const largerSet = firstSet.size <= secondSet.size ? secondSet : firstSet;

    for (const pokemonName of smallerSet) {
      if (largerSet.has(pokemonName)) {
        return true;
      }
    }

    return false;
  }

  private pickUniqueRandomTypes(amount: number): string[] {
    return this.shuffle([...this.types]).slice(0, amount);
  }

  private shuffle<T>(list: T[]): T[] {
    for (let i = list.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [list[i], list[randomIndex]] = [list[randomIndex], list[i]];
    }
    return list;
  }

  checkForGuess(guess: PTBoardGuess) {
    if(guess.pokemon) {
      this.pokeInput.setValue(guess.pokemon.name);
    } else {
      this.pokeInput.clearInput();
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
        isCorrect: this.isValidGuessForPosition(pokemon, rowIndex, columnIndex),
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
      this.updateRequestCompletion();
      this.currentGuess = updatedGuess;
      return;
    }

    this.currentGuess = {
      isCorrect: false,
      ...this.currentGuess,
      pokemon,
    };
  }

  private isValidGuessForPosition(pokemon: PokemonApiResponse, rowIndex: number, columnIndex: number): boolean {
    const rowType = this.board.requestsR[rowIndex]?.text;
    const columnType = this.board.requestsC[columnIndex]?.text;

    if (!rowType || !columnType) {
      return false;
    }

    const pokemonTypes = new Set(pokemon.types.map((entry) => entry.type.name));
    return pokemonTypes.has(rowType) && pokemonTypes.has(columnType);
  }

  private updateRequestCompletion(): void {
    const requestsR = this.board.requestsR.map((request, rowIndex) => ({
      ...request,
      isCompleted: this.board.guesses[rowIndex].every((guess) => guess.isCorrect),
    }));

    const requestsC = this.board.requestsC.map((request, columnIndex) => ({
      ...request,
      isCompleted: this.board.guesses.every((row) => row[columnIndex]?.isCorrect),
    }));

    this.board = {
      ...this.board,
      requestsR,
      requestsC,
    };

    if (this.isGameFinished()) {
      this.gameFinished.emit();
    }
  }

  isGameFinished(): boolean {
    if (!this.board.guesses.length) {
      return false;
    }

    return this.board.guesses.every((row) =>
      row.every((guess) => Boolean(guess.pokemon) && guess.isCorrect)
    );
  }

  reset(): void {
    this.currentGuess = undefined;
    this.resultMessage = '';
    this.initializeData();
  }

}
