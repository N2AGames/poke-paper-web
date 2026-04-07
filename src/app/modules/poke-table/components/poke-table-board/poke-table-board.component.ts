import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PokemonApiResponse } from '../../../shared/models/pokemon-api.model';
import { ReactiveFormsModule } from '@angular/forms';
import { InputAuto } from '../../../shared/components/input-auto/input-auto.component';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { CommonModule } from '@angular/common';
import { Utils } from '../../../shared/utils';

export interface PTBoard {
  requestsC: PTBoardRequest[];
  requestsR: PTBoardRequest[];
  guesses: PTBoardGuess[][];
}

export interface PTBoardRequest {
  text: string;
  displayText: string;
  kind: 'type' | 'generation';
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
  private generationPokemonMap = new Map<string, Set<string>>();
  private readonly generationKeys = ['gen-1','gen-2','gen-3','gen-4','gen-5','gen-6','gen-7','gen-8','gen-9'];
  private typeRequests: PTBoardRequest[] = [];
  private generationRequests: PTBoardRequest[] = [];

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
      await this.setupGenerationData();
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
    this.typeRequests = this.types.map((t) => this.makeTypeRequest(t));
  }

  private async setupGenerationData(): Promise<void> {
    const genEntries = await Promise.all(this.generationKeys.map(async (genKey) => {
      const genNum = parseInt(genKey.replace('gen-', ''));
      const names = await this.pokemonDataService.getPokemonNamesByGeneration(genNum);
      return [genKey, new Set(names)] as const;
    }));

    this.generationPokemonMap = new Map(genEntries);
    this.generationRequests = this.generationKeys.map((g) => this.makeGenerationRequest(g));
  }

  private makeTypeRequest(type: string): PTBoardRequest {
    return { text: type, displayText: type, kind: 'type', isCompleted: false };
  }

  private makeGenerationRequest(gen: string): PTBoardRequest {
    const num = gen.replace('gen-', '');
    return { text: gen, displayText: `Gen ${num}`, kind: 'generation', isCompleted: false };
  }

  initializeBoard(): PTBoard {
    const { columnRequests, rowRequests } = this.selectCompatibleRequests();
    return this.createEmptyBoard(columnRequests, rowRequests);
  }

  private createEmptyBoard(columnRequests: PTBoardRequest[], rowRequests: PTBoardRequest[]): PTBoard {
    const requestsC = columnRequests.map((r) => ({ ...r, isCompleted: false }));
    const requestsR = rowRequests.map((r) => ({ ...r, isCompleted: false }));
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

  private selectCompatibleRequests(): { columnRequests: PTBoardRequest[]; rowRequests: PTBoardRequest[] } {
    // 1 = generations in columns, 2 = generations in rows (always one of the two)
    const genPlacement = Math.random() < 0.5 ? 1 : 2;

    const columnPool = genPlacement === 1
      ? [...this.typeRequests, ...this.generationRequests]
      : this.typeRequests;

    const rowPool = genPlacement === 2
      ? [...this.typeRequests, ...this.generationRequests]
      : this.typeRequests;

    if (columnPool.length < this.width || rowPool.length < this.height) {
      throw new Error('Not enough requests to build board');
    }

    for (let attempt = 0; attempt < this.maxBoardGenerationAttempts; attempt++) {
      const columnRequests = this.shuffle([...columnPool]).slice(0, this.width);

      const compatibleRowRequests = rowPool.filter((r) =>
        columnRequests.every((c) => this.hasIntersection(r, c))
      );

      if (compatibleRowRequests.length >= this.height) {
        return {
          columnRequests,
          rowRequests: this.shuffle([...compatibleRowRequests]).slice(0, this.height),
        };
      }
    }

    throw new Error('Unable to generate a board with valid request combinations');
  }

  private hasIntersection(a: PTBoardRequest, b: PTBoardRequest): boolean {
    if (a.kind === 'type' && b.kind === 'type') {
      return this.hasTypeIntersection(a.text, b.text);
    }
    if (a.kind === 'generation' && b.kind === 'type') {
      return this.hasGenTypeIntersection(a.text, b.text);
    }
    if (a.kind === 'type' && b.kind === 'generation') {
      return this.hasGenTypeIntersection(b.text, a.text);
    }
    // gen + gen: never valid
    return false;
  }

  private hasGenTypeIntersection(gen: string, type: string): boolean {
    const genSet = this.generationPokemonMap.get(gen);
    const typeSet = this.typePokemonMap.get(type);
    if (!genSet || !typeSet) return false;

    const smaller = genSet.size <= typeSet.size ? genSet : typeSet;
    const larger = genSet.size <= typeSet.size ? typeSet : genSet;

    for (const name of smaller) {
      if (larger.has(name)) return true;
    }
    return false;
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
    const rowRequest = this.board.requestsR[rowIndex];
    const columnRequest = this.board.requestsC[columnIndex];

    if (!rowRequest || !columnRequest) {
      return false;
    }

    return this.satisfiesRequests(pokemon, rowRequest, columnRequest);
  }

  private satisfiesRequests(pokemon: PokemonApiResponse, rowRequest: PTBoardRequest, columnRequest: PTBoardRequest): boolean {
    if(rowRequest.kind === 'type' && columnRequest.kind === 'type' && rowRequest.text === columnRequest.text) {
      return pokemon.types.every((entry) => entry.type.name === rowRequest.text);
    } else {
      return this.satisfiesRequest(pokemon, rowRequest) && this.satisfiesRequest(pokemon, columnRequest);
    }
  }

  private satisfiesRequest(pokemon: PokemonApiResponse, request: PTBoardRequest): boolean {
    if (request.kind === 'type') {
      return pokemon.types.some((entry) => entry.type.name === request.text);
    }
    if (request.kind === 'generation') {
      const genNum = parseInt(request.text.replace('gen-', ''));
      return Utils.getGenerationFromId(pokemon.id) === genNum;
    }
    return false;
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

  getHintStyle(text: string, isCompleted: boolean): { [key: string]: string } {
    if (isCompleted) {
      return {};
    }

    const pastelColor = Utils.isGenerationLabel(text)
      ? Utils.getPastelColorByGeneration(text)
      : Utils.getPastelColorByType(text);

    return {
      'background-color': pastelColor,
      color: Utils.getReadableTextColor(pastelColor),
    };
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
    this.pokeInput.clearInput();
    this.initializeData();
  }

}
