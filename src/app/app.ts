import { Component, signal, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PokemonDataService } from './modules/shared/services/pokemon-data.service';
import { PokemonApiResponse } from './modules/shared/models/pokemon-api.model';
import { FooterComponent } from './modules/shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css', '../styles.css']
})
export class App implements AfterViewInit {
  protected readonly title = signal('poke-paper-web');
  protected readonly isLoading = signal(true);
  private isBrowser: boolean;
  private readonly backgroundStorageKey = 'background-pokemons-sprites';

  constructor(
    private pokemonDataService: PokemonDataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      this.isLoading.set(false);
      return;
    }

    const storedSprites = sessionStorage.getItem(this.backgroundStorageKey);
    if (storedSprites) {
      try {
        const sprites = JSON.parse(storedSprites) as string[];
        if (Array.isArray(sprites) && sprites.length > 0) {
          this.createBackgroundFromSprites(sprites);
          this.finishLoading(300);
          return;
        }
      } catch (error) {
        console.error('Error parsing stored background sprites:', error);
      }
    } else {
      this.newBackground();
    }
  }

  newBackground() {
    if (this.isBrowser) {
      // Calcular cuántos pokemon necesitamos para llenar la pantalla
      const diamondWidth = 100;
      const diamondHeight = 60;
      const cols = Math.ceil(window.innerWidth / diamondWidth) + 4;
      const rows = Math.ceil(window.innerHeight / (diamondHeight / 2)) + 12;
      const totalPokemons = rows * cols;
      
      this.pokemonDataService.getRandomPokemons(totalPokemons).then(pokemons => {
        this.createBackgroundPokemons(pokemons);
      }).catch(error => {
        console.error('Error fetching random Pokémons on app init:', error);
        this.isLoading.set(false);
      });
    } else {
      this.isLoading.set(false);
    }
  }

  createBackgroundPokemons(pokemons: PokemonApiResponse[]) {
    const sprites = pokemons
      .map((pokemon) => pokemon.sprites.front_default || '')
      .filter((sprite) => sprite.length > 0);

    if (sprites.length === 0) {
      this.isLoading.set(false);
      return;
    }

    this.createBackgroundFromSprites(sprites);
    sessionStorage.setItem(this.backgroundStorageKey, JSON.stringify(sprites));

    this.finishLoading(1500);
  }

  private finishLoading(delayMs: number) {
    setTimeout(() => {
      this.isLoading.set(false);
    }, delayMs);
  }

  private createBackgroundFromSprites(sprites: string[]) {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    const existingBackground = document.getElementById('background-pokemons');
    if (existingBackground) {
      existingBackground.remove();
    }

    // Creo un fondo en patron de diamantes con las imagenes de los pokemons obtenidos
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

    // Parametros del patron de diamantes
    const diamondWidth = 75;
    const diamondHeight = 60;
    const cols = Math.ceil(window.innerWidth / diamondWidth) + 4;
    const rows = Math.ceil(window.innerHeight / (diamondHeight / 2)) + 4;

    let spriteIndex = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const sprite = sprites[spriteIndex];
        if (!sprite) break;
        spriteIndex++;

        const diamond = document.createElement('div');
        diamond.style.position = 'absolute';
        diamond.style.width = diamondWidth + 'px';
        diamond.style.height = diamondHeight + 'px';

        // Posicionamiento en patron de diamantes (filas pares e impares alternadas)
        const offsetX = (row % 2) * (diamondWidth / 2);
        diamond.style.left = (col * diamondWidth + offsetX - diamondWidth) + 'px';
        diamond.style.top = (row * diamondHeight / 2 - diamondHeight) + 'px';

        // Usar clip-path para crear forma de diamante
        diamond.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

        // Usar background-image para mejor centrado del contenido
        diamond.style.backgroundImage = `url('${sprite}')`;
        diamond.style.backgroundSize = '50%';
        diamond.style.backgroundPosition = 'center';
        diamond.style.backgroundRepeat = 'no-repeat';
        diamond.style.filter = 'brightness(0) drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))';

        backgroundContainer.appendChild(diamond);
      }
    }

    appContainer.appendChild(backgroundContainer);
  }
}

