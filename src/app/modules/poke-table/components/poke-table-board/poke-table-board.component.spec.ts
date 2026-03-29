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
  };

  const pokemonResponse = {
    name: 'pikachu',
    sprites: {
      front_default: 'pikachu.png',
    },
  } as PokemonApiResponse;

  beforeEach(async () => {
    pokemonDataServiceMock = {
      getAllPokemonNames: async () => ({ results: [] }),
      getPokemonData: async () => pokemonResponse,
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
});
