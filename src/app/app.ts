import { Component, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PokemonDataService } from './modules/shared/services/pokemon-data.service';
import { PokemonApiResponse } from './modules/shared/models/pokemon-api.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css', '../styles.css']
})
export class App {
  protected readonly title = signal('poke-paper-web');
  private isBrowser: boolean;

  constructor(
    private pokemonDataService: PokemonDataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      // Calcular cuántos pokemon necesitamos para llenar la pantalla
      const diamondWidth = 100;
      const diamondHeight = 60;
      const cols = Math.ceil(window.innerWidth / diamondWidth) + 4;
      const rows = Math.ceil(window.innerHeight / (diamondHeight / 2)) + 12;
      const totalPokemons = rows * cols;
      
      this.pokemonDataService.getRandomPokemons(totalPokemons).then(pokemons => {
        createBackgroundPokemons(pokemons);
      }).catch(error => {
        console.error('Error fetching random Pokémons on app init:', error);
      });
    }
  }
}

function createBackgroundPokemons(pokemons: PokemonApiResponse[]) {
  // Creo un fondo en patrón de diamantes con las imágenes de los pokémons obtenidos
  const appContainer = document.getElementById('app-container');
  if (!appContainer) return;

  const backgroundContainer = document.createElement('div');
  backgroundContainer.id = 'background-pokemons';
  backgroundContainer.style.position = 'fixed';
  backgroundContainer.style.top = '0';
  backgroundContainer.style.left = '0';
  backgroundContainer.style.width = '100vw';
  backgroundContainer.style.height = '100vh';
  backgroundContainer.style.zIndex = '-1';
  backgroundContainer.style.pointerEvents = 'none';
  backgroundContainer.style.overflow = 'hidden';
  backgroundContainer.style.opacity = '0.40';

  // Parámetros del patrón de diamantes
  const diamondWidth = 75;
  const diamondHeight = 60;
  const cols = Math.ceil(window.innerWidth / diamondWidth) + 4;
  const rows = Math.ceil(window.innerHeight / (diamondHeight / 2)) + 4;

  let pokemonIndex = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Usar el índice secuencial sin repetir
      const pokemon = pokemons[pokemonIndex];
      if (!pokemon) break; // Si no hay más pokemon, salir
      pokemonIndex++;
      
      const diamond = document.createElement('div');
      diamond.style.position = 'absolute';
      diamond.style.width = diamondWidth + 'px';
      diamond.style.height = diamondHeight + 'px';
      
      // Posicionamiento en patrón de diamantes (filas pares e impares alternadas)
      const offsetX = (row % 2) * (diamondWidth / 2);
      diamond.style.left = (col * diamondWidth + offsetX - diamondWidth) + 'px';
      diamond.style.top = (row * diamondHeight / 2 - diamondHeight) + 'px';
      
      // Usar clip-path para crear forma de diamante
      diamond.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      
      // Usar background-image para mejor centrado del contenido
      diamond.style.backgroundImage = `url('${pokemon.sprites.front_default || ''}')`;
      diamond.style.backgroundSize = '50%';
      diamond.style.backgroundPosition = 'center';
      diamond.style.backgroundRepeat = 'no-repeat';
      diamond.style.filter = 'brightness(0) drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))';
      
      backgroundContainer.appendChild(diamond);
    }
  }

  appContainer.appendChild(backgroundContainer);
}

