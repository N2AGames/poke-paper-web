import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, ChangeDetectorRef, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PokemonApiResponse } from '../../../shared/models/pokemon-api.model';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { indexToColor, processCanvasImage, ProcessingConfig } from 'picross-image-processor';

@Component({
  selector: 'app-picross',
  imports: [],
  templateUrl: './picross.html',
  styleUrls: ['./picross.css', '../../../../../styles.css', '../../../shared/styles/buttons.css'],
})
export class Picross implements OnInit, AfterViewInit {

  @ViewChild('gameBoard', { static: false }) gameBoard!: ElementRef;
  @ViewChild('container', { static: false }) container!: ElementRef;

  board: boolean[][] = [];
  solutionBoard: number[][] = [];
  rowHints: number[][] = [];
  colHints: number[][] = [];
  maxRowHintCount: number = 0;
  maxColHintCount: number = 0;
  boardSize: number = 18;
  cellSize: number = 30;

  pokeData: PokemonApiResponse = {} as PokemonApiResponse;

  private cdr = inject(ChangeDetectorRef);
  private pokemonDataService = inject(PokemonDataService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.initializeBoard(this.boardSize, this.boardSize); // Initialize a 36x36 board
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  loadData() {
    this.pokemonDataService.getPokemonDataRandom(9).then(data => {
      this.pokeData = data;
      this.processPokeImage();
    }).catch(error => {
      console.error('Error loading Pokemon data:', error);
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.calculateCellSize();
      this.cdr.detectChanges();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.calculateCellSize();
    }
  }

  calculateCellSize() {
    if (this.container && this.container.nativeElement) {
      const containerElement = this.container.nativeElement as HTMLElement;
      
      // Get computed style to account for padding
      const computedStyle = window.getComputedStyle(containerElement);
      const paddingLeft = parseFloat(computedStyle.paddingLeft);
      const paddingRight = parseFloat(computedStyle.paddingRight);
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);
      
      const containerWidth = containerElement.clientWidth - paddingLeft - paddingRight;
      const containerHeight = containerElement.clientHeight - paddingTop - paddingBottom;

      const titleElement = containerElement.querySelector('.title') as HTMLElement | null;
      const titleHeight = titleElement ? titleElement.getBoundingClientRect().height : 0;
      const gapValue = parseFloat(computedStyle.rowGap || computedStyle.gap || '0');
      const availableHeight = containerHeight - titleHeight - gapValue;

      const rows = this.board.length;
      const cols = this.board[0]?.length || 0;
      const gridRows = rows + this.maxColHintCount;
      const gridCols = cols + this.maxRowHintCount;

      const borderAllowance = 8;
      const maxWidth = containerWidth - borderAllowance;
      const maxHeight = availableHeight - borderAllowance;

      if (gridRows > 0 && gridCols > 0) {
        const nextSize = Math.floor(Math.min(maxWidth / gridCols, maxHeight / gridRows));
        this.cellSize = Math.max(1, nextSize);
      }
    }
  }

  initializeBoard(rows: number, cols: number) {
    this.board = this.createMarkedBoard(rows, cols, true);
    this.solutionBoard = this.createBoard(rows, cols, 0);
    this.updateHintsFromSolution();
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.calculateCellSize();
      }
    }, 0);
  }

  private createBoard(rows: number, cols: number, fillValue: number): number[][] {
    return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
  }

  private createMarkedBoard(rows: number, cols: number, fillValue: boolean): boolean[][] {
    return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
  }

  private updateHintsFromSolution(): void {
    const rows = this.solutionBoard.length;
    const cols = this.solutionBoard[0]?.length ?? 0;

    if (rows === 0 || cols === 0) {
      this.rowHints = [];
      this.colHints = [];
      this.maxRowHintCount = 0;
      this.maxColHintCount = 0;
      return;
    }

    this.rowHints = this.solutionBoard.map(row => this.buildHintsFromLine(row));
    this.colHints = Array.from({ length: cols }, (_, colIndex) => {
      const colValues = this.solutionBoard.map(row => row[colIndex]);
      return this.buildHintsFromLine(colValues);
    });

    this.maxRowHintCount = Math.max(...this.rowHints.map(hints => hints.length));
    this.maxColHintCount = Math.max(...this.colHints.map(hints => hints.length));
  }

  private buildHintsFromLine(values: number[]): number[] {
    const hints: number[] = [];
    let run = 0;

    for (const value of values) {
      if (value > 0) {
        run += 1;
        continue;
      }

      if (run > 0) {
        hints.push(run);
        run = 0;
      }
    }

    if (run > 0) {
      hints.push(run);
    }

    return hints.length > 0 ? hints : [0];
  }

  toggleCell(rowIndex: number, colIndex: number): void {
    if (!this.board[rowIndex]) {
      return;
    }

    this.board[rowIndex][colIndex] = !this.board[rowIndex][colIndex];
  }

  markAllCells(): void {
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[i].length; j++) {
        this.board[i][j] = true;
      }
    }
  }

  isMarked(rowIndex: number, colIndex: number): boolean {
    return this.board[rowIndex]?.[colIndex] ?? false;
  }

  getCellBackground(rowIndex: number, colIndex: number): string {
    const marked = this.isMarked(rowIndex, colIndex);
    const value = this.solutionBoard[rowIndex]?.[colIndex] ?? 0;

    if (!marked) {
      return '#e6e6e6';
    }

    if (value <= 0) {
      return '#e6e6e6';
    }

    const color = indexToColor(value);
    return this.rgbToHex(color.r, color.g, color.b);
  }

  getCellText(rowIndex: number, colIndex: number): string {
    const marked = this.isMarked(rowIndex, colIndex);
    const value = this.solutionBoard[rowIndex]?.[colIndex] ?? 0;

    if (!marked || value <= 0) {
      return 'X';
    }

    return '';
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (value: number) => {
      const clamped = Math.max(0, Math.min(255, Math.round(value)));
      return clamped.toString(16).padStart(2, '0');
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  processPokeImage() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log('Processing Pokemon image for:', this.pokeData.name);
    const imageUrl = this.pokeData.sprites.front_default;
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = async () => {
      try {
        const config: ProcessingConfig = {
          boardSize: this.boardSize,
          colorThreshold: 40,
          alphaThreshold: 128,
          colorMode: true
        };

        const result = await processCanvasImage(img, config);
        this.solutionBoard = result.board;
        this.board = this.createMarkedBoard(this.solutionBoard.length, this.solutionBoard[0]?.length ?? 0, true);
        this.updateHintsFromSolution();
        this.calculateCellSize();
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error processing image:', error);
      }
    };

    img.onerror = () => {
      console.error('Error loading Pokemon image');
    };

    img.src = imageUrl;
  }
}
