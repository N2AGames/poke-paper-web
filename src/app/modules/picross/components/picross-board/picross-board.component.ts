import { Component, Input, OnChanges, OnInit, SimpleChanges, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { indexToColor, PicrossBoardData, PicrossCellData, PicrossClueData, processImageUrl, ProcessingConfig, recalculateClueColors } from 'picross-image-processor';
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

  board: PicrossBoardData | undefined;
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
    const cellSize = Math.max(16, Math.min(36, 360 / maxTableSize)); // Entre 16px y 36px
    this.boardStyles = { '--cell-size': `${cellSize}px` };
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
    if(!cell.enabled) return;
    cell.pushed = !cell.pushed;

    if(!cell.correct) {
      cell.text = cell.pushed ? 'x' : '';
      cell.color = '#ffb3b3';
    }

    if (this.board) {
      recalculateClueColors(this.board);
      this.cdr.markForCheck();
    }
  }
}

