import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { PokeTableBoard } from './poke-table-board.component';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { PokemonApiResponse } from '../../../shared/models/pokemon-api.model';

describe('PokeTableBoard', () => {
  let component: PokeTableBoard;
  let fixture: ComponentFixture<PokeTableBoard>;
  let pokemonDataServiceMock: {
    getAllPokemonNames: () => Promise<{ results: { name: string }[] }>;
    getPokemonData: (pokemonName: string) => Promise<PokemonApiResponse>;
    getTypes: () => Promise<string[]>;
    getPokemonNamesByType: (typeName: string) => Promise<string[]>;
  };

  const pokemonResponse = {
    name: 'pikachu',
    sprites: {
      front_default: 'pikachu.png',
    },
    types: [
      { type: { name: 'electric', url: '' } }
    ],
  } as PokemonApiResponse;

  const charizardResponse = {
    name: 'charizard',
    sprites: {
      front_default: 'charizard.png',
    },
    types: [
      { type: { name: 'fire', url: '' } },
      { type: { name: 'flying', url: '' } },
    ],
  } as PokemonApiResponse;

  const gyaradosResponse = {
    name: 'gyarados',
    sprites: {
      front_default: 'gyarados.png',
    },
    types: [
      { type: { name: 'water', url: '' } },
      { type: { name: 'flying', url: '' } },
    ],
  } as PokemonApiResponse;

  beforeEach(async () => {
    const typePokemonMap: Record<string, string[]> = {
      fire: ['charizard', 'rotom-heat', 'volcanion'],
      water: ['rotom-wash', 'volcanion', 'lanturn'],
      electric: ['rotom-heat', 'rotom-wash', 'lanturn'],
      flying: ['charizard', 'gyarados', 'landorus-incarnate'],
      ground: ['landorus-incarnate', 'golem', 'gastrodon'],
      rock: ['golem', 'aerodactyl', 'omastar'],
    };

    pokemonDataServiceMock = {
      getAllPokemonNames: async () => ({ results: [] }),
      getPokemonData: async () => pokemonResponse,
      getTypes: async () => Object.keys(typePokemonMap),
      getPokemonNamesByType: async (typeName: string) => typePokemonMap[typeName] ?? [],
    };

    await TestBed.configureTestingModule({
      imports: [PokeTableBoard],
      providers: [
        { provide: PokemonDataService, useValue: pokemonDataServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokeTableBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the selected guess panel when a pokemon is selected', fakeAsync(() => {
    pokemonDataServiceMock.getPokemonData = async () => pokemonResponse;

    const selectedGuess = component.board.guesses[0][0];
    component.checkForGuess(selectedGuess);

    component.pokemonSelected('pikachu');
    tick();
    fixture.detectChanges();

    const updatedGuess = component.board.guesses[0][0];

    expect(updatedGuess).not.toBe(selectedGuess);
    expect(updatedGuess.pokemon).toEqual(pokemonResponse);
    expect(component.currentGuess).toBe(updatedGuess);

    const image = fixture.nativeElement.querySelector('.guess-panel img') as HTMLImageElement | null;
    expect(image?.getAttribute('alt')).toBe('pikachu');
  }));

  it('should show a message when selecting without an active guess', () => {
    component.currentGuess = undefined;

    let getPokemonDataCalled = false;
    pokemonDataServiceMock.getPokemonData = async () => {
      getPokemonDataCalled = true;
      return pokemonResponse;
    };

    component.pokemonSelected('pikachu');

    expect(component.resultMessage).toBe('Por favor, selecciona una casilla para adivinar primero.');
    expect(getPokemonDataCalled).toBe(false);
  });

  it('should mark guess as correct when pokemon matches row and column types', fakeAsync(() => {
    component.board = {
      requestsC: [{ text: 'fire', isCompleted: false }],
      requestsR: [{ text: 'flying', isCompleted: false }],
      guesses: [[{ pokemon: undefined, isCorrect: false }]],
    };

    pokemonDataServiceMock.getPokemonData = async () => charizardResponse;

    component.checkForGuess(component.board.guesses[0][0]);
    component.pokemonSelected('charizard');
    tick();

    expect(component.board.guesses[0][0].isCorrect).toBe(true);
    expect(component.board.requestsC[0].isCompleted).toBe(true);
    expect(component.board.requestsR[0].isCompleted).toBe(true);
  }));

  it('should mark guess as incorrect when pokemon does not match both hint types', fakeAsync(() => {
    component.board = {
      requestsC: [{ text: 'fire', isCompleted: false }],
      requestsR: [{ text: 'flying', isCompleted: false }],
      guesses: [[{ pokemon: undefined, isCorrect: false }]],
    };

    pokemonDataServiceMock.getPokemonData = async () => gyaradosResponse;

    component.checkForGuess(component.board.guesses[0][0]);
    component.pokemonSelected('gyarados');
    tick();

    expect(component.board.guesses[0][0].isCorrect).toBe(false);
    expect(component.board.requestsC[0].isCompleted).toBe(false);
    expect(component.board.requestsR[0].isCompleted).toBe(false);
    expect(component.isGameFinished()).toBe(false);
  }));

  it('should report game finished only when all guesses are correct', () => {
    component.board = {
      requestsC: [
        { text: 'fire', isCompleted: true },
        { text: 'water', isCompleted: true },
      ],
      requestsR: [{ text: 'flying', isCompleted: true }],
      guesses: [[
        { pokemon: charizardResponse, isCorrect: true },
        { pokemon: gyaradosResponse, isCorrect: true },
      ]],
    };

    expect(component.isGameFinished()).toBe(true);

    component.board.guesses[0][1] = { pokemon: gyaradosResponse, isCorrect: false };
    expect(component.isGameFinished()).toBe(false);

    component.board.guesses[0][1] = { pokemon: undefined, isCorrect: false };
    expect(component.isGameFinished()).toBe(false);
  });
});
