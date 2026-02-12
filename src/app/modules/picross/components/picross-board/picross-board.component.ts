import { Component, Input, OnChanges, OnInit, SimpleChanges, Inject, PLATFORM_ID, ChangeDetectorRef, HostListener } from '@angular/core';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { PicrossBoardData, PicrossCellData, processImageUrl, ProcessingConfig, recalculateClueColors } from 'picross-image-processor';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

enum GameState {
  IN_PROGRESS, FINISHED_OK, FINISHED_FAIL
}

@Component({
  selector: 'picross-board',
  imports: [MatIconModule],
  templateUrl: './picross-board.component.html',
  styleUrls: ['./picross-board.component.css', '../../../../app.css', '../../../shared/styles/buttons.css'],
})
export class PicrossBoard implements OnInit, OnChanges {

  @Input() rows: number = 5;
  @Input() columns: number = 5;
  @Input() action: string = 'guess'; // 'guess' o 'mark'

  board: PicrossBoardData | undefined;
  boardLoaded = false;
  boardStyles: any = {};

  gameState: GameState = GameState.IN_PROGRESS;
  max_lifes: number = 3;
  lifes: number = this.max_lifes;
  resultMessage: string = '';

  private isBrowser: boolean = false;

  constructor(
    private pokeDataService: PokemonDataService,
    @Inject(PLATFORM_ID) platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.updateBoardStyles();
    this.loadBoard();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser) return;
    // Actualizar estilos si cambian dimensiones
    if (changes['rows'] || changes['columns']) {
      this.updateBoardStyles();
    }
    // Solo cargar si las propiedades existían antes (para evitar doble carga en init)
    if ((changes['rows']?.previousValue !== undefined || changes['columns']?.previousValue !== undefined) &&
        (changes['rows'] || changes['columns'])) {  
      this.loadBoard();
    }
  }

  loadBoard(): void {
    this.boardLoaded = false;
    this.pokeDataService.getPokemonDataRandom(9).then(pokeData => {
      const imageUrl = pokeData.sprites.front_default;
      if (!imageUrl) {
        console.warn('No se pudo obtener la imagen del Pokémon');
        return;
      }
      this.processPokeImage(imageUrl).then(board => {
        this.board = board;
        this.boardLoaded = true;
        this.cdr.detectChanges();
      }).catch(() => {
        console.warn('Error al procesar la imagen del Pokémon');
      });
    }).catch(() => {
      console.log('Error al obtener datos del Pokémon');
    });
  }

  private updateBoardStyles(): void {
    const maxTableSize = Math.max(this.rows, this.columns);
    const isLargeBoard = maxTableSize >= 20;
    const containerWidth = this.isBrowser
      ? (document.getElementById('game-container')?.getBoundingClientRect().width ?? window.innerWidth)
      : 800;
    const availableWidth = Math.max(320, containerWidth - 40);
    const widthDivisor = isLargeBoard ? maxTableSize + 5 : maxTableSize + 4;
    const widthLimitedCell = availableWidth / widthDivisor;
    const viewportHeight = this.isBrowser ? window.innerHeight : 800;
    const footerHeight = this.isBrowser
      ? (document.getElementById('app-footer')?.getBoundingClientRect().height ?? 110)
      : 110;
    const controlsReserve = isLargeBoard ? 76 : 32;
    const availableHeight = Math.max(250, viewportHeight - footerHeight - controlsReserve);
    const verticalUsage = isLargeBoard ? 0.58 : 0.64;
    const heightDivisor = isLargeBoard ? maxTableSize + 5 : maxTableSize + 4;
    const heightLimitedCell = (availableHeight * verticalUsage) / heightDivisor;
    const maxCellSize = isLargeBoard ? 32 : 36;
    const cellSize = Math.max(10, Math.min(maxCellSize, Math.min(widthLimitedCell, heightLimitedCell)));
    const clueSize = Math.max(32, Math.min(72, cellSize * 3));
    this.boardStyles = {
      '--cell-size': `${cellSize}px`,
      '--clue-size': `${clueSize}px`
    };
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!this.isBrowser) return;
    this.updateBoardStyles();
    this.cdr.markForCheck();
  }

  processPokeImage(imgSrc: string): Promise<PicrossBoardData> {
    const config: ProcessingConfig = {
      boardSize: this.rows,
      colorThreshold: 100,
      alphaThreshold: 128,
      colorMode: true
    };
    return processImageUrl(imgSrc, config).then(result => {
      return result.board;
    }).catch(() => {
      const rows = Array.from({ length: this.rows }, () => Array(this.columns).fill(0));
      return {
        rows: rows,
        rowClues: Array(this.rows).fill([{ value: 0, completed: false }]),
        columnClues: Array(this.columns).fill([{ value: 0, completed: false }])
      } as unknown as PicrossBoardData;
    });
  }

  pushCell(cell: PicrossCellData): void {
    if(!cell.enabled) return; // No permitir marcar si ya se ha adivinado correctamente
    if(this.action === 'guess') {
      if(!cell.marked) {
        this.guessCell(cell);
      }
    } else if(this.action === 'mark') {
      this.markCell(cell);
    }
  }

  markCell(cell: PicrossCellData) {
    cell.marked = !cell.marked;
  }

  guessCell(cell: PicrossCellData) {
    cell.pushed = !cell.pushed;

    if(!cell.correct && cell.pushed) {
      // Si el jugador ha adivinado mal, marcar la celda con una 'x' y luego desmarcarla después de un tiempo
      this.guessFailed(cell);
    } else {
      // Recalcular colores de pistas después de cada intento
      this.guessSuccess(cell);
    }
  }

  guessSuccess(cell: PicrossCellData) {
    cell.enabled = false; // Deshabilitar la celda después de adivinar correctamente
    if (this.board) {
      recalculateClueColors(this.board);

      // Verificar si el juego ha terminado
      if (this.board && this.gameState === GameState.IN_PROGRESS) {
        this.gameState = this.board.rows.every(row => row.cells.every(cell => cell.correct === cell.pushed)) ? GameState.FINISHED_OK : GameState.IN_PROGRESS;
      }

      // Si el juego ha terminado, mostrar mensaje de resultado
      if (this.gameState === GameState.FINISHED_OK) {
        this.resultMessage = 'Congratulations! You solved the picross!';
      }

      this.cdr.markForCheck();
    }
  }

  guessFailed(cell: PicrossCellData) {
    cell.text = 'x';
    cell.color = '#ffb3b3';
    this.lifes--;
    if(this.lifes <= 0) {
      this.gameState = GameState.FINISHED_FAIL;
      this.resultMessage = 'Game Over! You have no more lifes left.';
    } else {
      setTimeout(() => {
        this.markCell(cell);
      }, 2000);
    }
  }

  reloadBoard(): void {
    this.resetBoard();
    this.loadBoard();
  }
  
  resetBoard() {
    if (this.board) {
      this.board.rows.forEach(row => {row.cells.forEach(cell => {
        cell.pushed = false;
        cell.text = '';
        if(!cell.correct) {
          cell.color = 'lightgray';
        }
        cell.enabled = true;
        cell.marked = false;
      })});
      // Reiniciar estado del juego
      this.gameState = GameState.IN_PROGRESS;
      // Recalcular colores de pistas
      recalculateClueColors(this.board);
    }
    this.gameState = GameState.IN_PROGRESS;
    this.lifes = this.max_lifes;
    this.resultMessage = '';
    this.cdr.markForCheck();
  }

  getCellColor(cell: PicrossCellData): string {
    if(cell.enabled) {
      if(cell.pushed && !cell.correct) {
        return '#aa2828';
      } else if (cell.correct) {
        return 'black';
      }
    } else {
      return '#6363634b';
    }
    return 'black';
  }

  isGameFinished(): boolean {
    return this.gameState === GameState.FINISHED_OK || this.gameState === GameState.FINISHED_FAIL;
  }
}

