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
  styleUrls: ['./picross-board.component.css'],
})
export class PicrossBoard implements OnInit, OnChanges {

  @Input() rows: number = 5;
  @Input() columns: number = 5;
  @Input() action: string = 'guess'; // 'guess' o 'mark'

  board: PicrossBoardData | undefined;
  boardLoaded = false;
  boardStyles: any = {};

  gameState: GameState = GameState.IN_PROGRESS;
  max_lives: number = 3;
  lives: number = this.max_lives;
  resultMessage: string = '';

  pokemonName: string = '';
  pokemonImg: string = '';

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
      this.pokemonName = pokeData.name;
      this.pokemonImg = pokeData.sprites.front_default;
      if (!this.pokemonImg) {
        console.warn('No se pudo obtener la imagen del Pokémon');
        return;
      }
      this.processPokeImage(this.pokemonImg).then(board => {
        this.board = board;
        this.updateBoardStyles();
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
    const isMediumBoard = maxTableSize >= 15;
    const isLargeBoard = maxTableSize >= 20;
    const maxColumnClues = this.getMaxColumnClues();
    const maxRowClues = this.getMaxRowClues();
    const containerWidth = this.isBrowser
      ? (document.getElementById('game-container')?.getBoundingClientRect().width ?? window.innerWidth)
      : 800;
    const horizontalReserve = isLargeBoard ? 72 : (isMediumBoard ? 56 : 40);
    const availableWidth = Math.max(260, containerWidth - horizontalReserve);
    const viewportHeight = this.isBrowser ? window.innerHeight : 800;
    const footerHeight = this.isBrowser
      ? (document.getElementById('app-footer')?.getBoundingClientRect().height ?? 110)
      : 110;
    const controlsReserve = isLargeBoard ? 170 : (isMediumBoard ? 140 : 90);
    const availableHeight = Math.max(200, viewportHeight - footerHeight - controlsReserve);
    const verticalUsage = isLargeBoard ? 0.5 : (isMediumBoard ? 0.55 : 0.64);
    const firstPassWidthDivisor = isLargeBoard ? maxTableSize + 7 : (isMediumBoard ? maxTableSize + 6 : maxTableSize + 4.5);
    const firstPassHeightDivisor = isLargeBoard ? maxTableSize + 7 : (isMediumBoard ? maxTableSize + 6 : maxTableSize + 4.5);
    const firstPassCell = Math.min(availableWidth / firstPassWidthDivisor, (availableHeight * verticalUsage) / firstPassHeightDivisor);
    const minCellSize = isLargeBoard ? 7 : (isMediumBoard ? 8 : 10);
    const maxCellSize = isLargeBoard ? 24 : (isMediumBoard ? 30 : 36);
    const firstPassClueFont = Math.max(6, Math.min(isLargeBoard ? 8 : (isMediumBoard ? 9 : 10), firstPassCell * 0.45));
    const firstPassGap = firstPassCell < 12 ? 1 : 2;
    const firstPassClueCell = Math.max(firstPassClueFont * 1.85, firstPassCell * 0.55);

    const rowClueSizeEstimate = Math.max(
      firstPassCell,
      Math.ceil(maxRowClues * (firstPassClueCell + firstPassGap) + 8)
    );
    const columnClueSizeEstimate = Math.max(
      firstPassCell,
      Math.ceil(maxColumnClues * (firstPassClueCell + firstPassGap) + 8)
    );

    const playableWidth = Math.max(120, availableWidth - rowClueSizeEstimate - firstPassGap * 2);
    const playableHeight = Math.max(120, availableHeight * verticalUsage - columnClueSizeEstimate - firstPassGap * 2);
    const widthLimitedCell = playableWidth / maxTableSize;
    const heightLimitedCell = playableHeight / maxTableSize;

    const cellSize = Math.max(minCellSize, Math.min(maxCellSize, Math.min(widthLimitedCell, heightLimitedCell)));
    const clueFontSize = Math.max(6, Math.min(isLargeBoard ? 8 : (isMediumBoard ? 9 : 10), cellSize * 0.45));
    const boardGap = cellSize < 12 ? 1 : 2;
    const clueCellSize = Math.max(clueFontSize * 1.85, cellSize * 0.55);
    const rowClueSize = Math.max(
      cellSize,
      Math.ceil(maxRowClues * (clueCellSize + boardGap) + 8)
    );
    const columnClueSize = Math.max(
      cellSize,
      Math.ceil(maxColumnClues * (clueCellSize + boardGap) + 8)
    );

    this.boardStyles = {
      '--cell-size': `${cellSize}px`,
      '--row-clue-size': `${rowClueSize}px`,
      '--column-clue-size': `${columnClueSize}px`,
      '--clue-font-size': `${clueFontSize}px`,
      '--clue-cell-size': `${clueCellSize}px`,
      '--board-gap': `${boardGap}px`
    };
  }

  private getMaxColumnClues(): number {
    if (!this.board?.columnClues?.length) {
      return Math.max(1, Math.ceil(this.columns / 2));
    }
    return Math.max(1, ...this.board.columnClues.map(clue => clue.length || 1));
  }

  private getMaxRowClues(): number {
    if (!this.board?.rowClues?.length) {
      return Math.max(1, Math.ceil(this.rows / 2));
    }
    return Math.max(1, ...this.board.rowClues.map(clue => clue.length || 1));
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
    } else if (cell.correct && cell.pushed) {
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
        // Comprobar si todas las celdas correctas han sido adivinadas
        const allCellsCorrect = this.board.rows.every(row => row.cells.every(c => !c.correct || (c.correct && c.pushed)));
        if (allCellsCorrect) {
          this.gameState = GameState.FINISHED_OK;
        }
      }

      // Si el juego ha terminado, mostrar mensaje de resultado
      if (this.gameState === GameState.FINISHED_OK) {
        this.resultMessage = 'Congratulations! You solved the picross! The pokemon was ' + this.pokemonName;
      }

      this.cdr.markForCheck();
    }
  }

  guessFailed(cell: PicrossCellData) {
    cell.text = 'x';
    cell.color = '#ffb3b3';
    cell.enabled = false; // Deshabilitar la celda después de adivinar mal
    this.lives--;
    if(this.lives <= 0) {
      this.gameState = GameState.FINISHED_FAIL;
      this.resultMessage = 'Game Over! You have no more lives left.';
      this.cdr.markForCheck();
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
    this.lives = this.max_lives;
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

