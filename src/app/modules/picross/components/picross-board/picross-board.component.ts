import { Component, Input, OnChanges, OnInit, SimpleChanges, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { PicrossBoardData, PicrossCellData } from '../../../shared/models/picross-board-data.model';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { indexToColor, processImageUrl, ProcessingConfig } from 'picross-image-processor';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'picross-board',
  imports: [],
  templateUrl: './picross-board.component.html',
  styleUrls: ['./picross-board.component.css', '../../../../app.css', '../../../shared/styles/buttons.css'],
})
export class PicrossBoard implements OnInit, OnChanges {

  @Input() rows: number = 5;
  @Input() columns: number = 5;

  board: PicrossBoardData = { rows: [], rowClues: [], columnClues: [] };
  boardLoaded = false;
  boardStyles: any = {};
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
        this.generateRandomBoard();
        return;
      }
      this.processPokeImage(imageUrl).then(board => {
        this.generateBoard(board);
      }).catch(() => {
        this.generateRandomBoard();
      });
    }).catch(() => {
      this.generateRandomBoard();
    });
  }

  generateRandomBoard(): void {
    const board = Array.from({ length: this.rows }, () => Array(this.columns).fill(0));
    this.generateBoard(board);
  }

  private updateBoardStyles(): void {
    const maxTableSize = Math.max(this.rows, this.columns);
    const cellSize = Math.max(16, Math.min(36, 360 / maxTableSize)); // Entre 16px y 36px
    this.boardStyles = { '--cell-size': `${cellSize}px` };
  }

  processPokeImage(imgSrc: string) {
    const config: ProcessingConfig = {
      boardSize: this.rows,
      colorThreshold: 100,
      alphaThreshold: 128,
      colorMode: true
    };
    return processImageUrl(imgSrc, config).then(result => {
      return result.board;
    }).catch(() => {
      return Array.from({ length: this.rows }, () => Array(this.columns).fill(0));
    });
  }

  generateBoard(board: number[][]) {
    const newRows: typeof this.board.rows = [];
    const newRowClues: number[][] = [];
    const newColumnClues: number[][] = [];

    for (let i = 0; i < board.length; i++) {
      const row = { cells: [] as PicrossCellData[]};
      for (let j = 0; j < board[i].length; j++) {
        const color = board[i][j];
        if (color === -1) {
          row.cells.push({ color: 'lightgray', enabled: true, pushed: false, correct: false, text: '' });
        } else {
          const rgbColor = indexToColor(color);
          row.cells.push({ color: `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`, enabled: true, pushed: false, correct: true, text: '' });
        }
      }
      newRows.push(row);
    }

    for (let i = 0; i < board.length; i++) {
      newRowClues.push(this.generateClues());
    }

    for (let i = 0; i < board[0].length; i++) {
      newColumnClues.push(this.generateClues());
    }
    
    this.board = { rows: newRows, rowClues: newRowClues, columnClues: newColumnClues };
    this.boardLoaded = true;
    this.cdr.detectChanges();
  }

  private generateClues(): number[] {
    const clueCount = Math.floor(Math.random() * 3) + 1;
    const clues: number[] = [];
    for (let i = 0; i < clueCount; i++) {
      clues.push(Math.floor(Math.random() * 5) + 1);
    }
    return clues;
  }

  pushCell(cell: PicrossCellData): void {
    if(!cell.enabled) return;
    cell.pushed = !cell.pushed;

    if(!cell.correct) {
      cell.text = cell.pushed ? 'x' : '';
      cell.color = '#ffb3b3';
    }
  }
}

