import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, ChangeDetectorRef, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PokemonApiResponse } from '../../../shared/models/pokemon-api.model';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { processImageData, ProcessingResult } from 'picross-image-processor';

@Component({
  selector: 'app-picross',
  imports: [],
  templateUrl: './picross.html',
  styleUrls: ['./picross.css', '../../../../../styles.css', '../../../shared/styles/buttons.css'],
})
export class Picross implements OnInit, AfterViewInit {

  @ViewChild('gameBoard', { static: false }) gameBoard!: ElementRef;
  @ViewChild('container', { static: false }) container!: ElementRef;

  board: number[][] = [];
  cellSize: number = 30;

  pokeData: PokemonApiResponse = {} as PokemonApiResponse;

  private cdr = inject(ChangeDetectorRef);
  private pokemonDataService = inject(PokemonDataService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.initializeBoard(32, 32); // Initialize a 32x32 board
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
      
      // Reserve space for title and padding
      const titleHeight = 60; // Approximate title height
      const availableHeight = containerHeight - titleHeight;
      
      // Use 90% of the available space
      const boardMaxSize = Math.min(containerWidth, availableHeight) * 0.9;
      
      // Calculate cell size based on the maximum number of cells (rows or cols)
      const maxCells = Math.max(this.board.length, this.board[0]?.length || 0);
      
      if (maxCells > 0) {
        this.cellSize = Math.floor(boardMaxSize / maxCells);
      }
    }
  }

  initializeBoard(rows: number, cols: number) {
    this.board = Array.from({ length: rows }, () => Array(cols).fill(0));
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.calculateCellSize();
      }
    }, 0);
  }

  toggleCell(rowIndex: number, colIndex: number): void {
    this.board[rowIndex][colIndex] = this.board[rowIndex][colIndex] === 1 ? 0 : 1;
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
    
    img.onload = () => {
      try {
        // Use canvas to get image data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match board dimensions
        const boardSize = this.board.length;
        canvas.width = boardSize;
        canvas.height = boardSize;

        // Draw the image to the canvas
        ctx.drawImage(img, 0, 0, boardSize, boardSize);

        // Get image data and process with library
        const imageData = ctx.getImageData(0, 0, boardSize, boardSize);
        
        // Use the picross-image-processor library to process the image
        const result = processImageData(imageData, {
          boardSize,
          colorThreshold: 80,
          alphaThreshold: 128
        });

        // Update board with processed data
        this.board = result.board;
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
