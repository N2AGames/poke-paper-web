import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { Utils } from '../../../shared/utils';
import { PokemonDataService } from '../../../shared/services/pokemon-data.service';
import { PokemonApiResponse } from '../../../shared/models/pokemon-api.model';

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

  constructor() {
    this.initializeBoard(32, 32); // Initialize a 72x72 board
  }

  ngOnInit() {
    this.loadData();
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
    this.calculateCellSize();
    this.cdr.detectChanges();
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateCellSize();
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
    setTimeout(() => this.calculateCellSize(), 0);
  }

  toggleCell(rowIndex: number, colIndex: number): void {
    this.board[rowIndex][colIndex] = this.board[rowIndex][colIndex] === 1 ? 0 : 1;
  }

  processPokeImage() {
    console.log('Processing Pokemon image for:', this.pokeData.name);
    const imageUrl = this.pokeData.sprites.front_default;
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      // First, draw the original image to find the bounding box
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tempCtx.drawImage(img, 0, 0);

      const tempImageData = tempCtx.getImageData(0, 0, img.width, img.height);
      const tempData = tempImageData.data;

      // Find bounding box of opaque pixels
      let minX = img.width;
      let minY = img.height;
      let maxX = 0;
      let maxY = 0;

      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const index = (y * img.width + x) * 4;
          const alpha = tempData[index + 3];
          
          if (alpha > 128) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      // Calculate cropped dimensions
      const cropWidth = maxX - minX + 1;
      const cropHeight = maxY - minY + 1;

      // Now draw the cropped image to the board canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const boardSize = this.board.length;
      canvas.width = boardSize;
      canvas.height = boardSize;

      // Draw the cropped and scaled image
      ctx.drawImage(
        img,
        minX, minY, cropWidth, cropHeight,  // source rectangle (cropped)
        0, 0, boardSize, boardSize           // destination rectangle (scaled)
      );

      // Get image data
      const imageData = ctx.getImageData(0, 0, boardSize, boardSize);
      const data = imageData.data;

      // Helper function to get pixel color
      const getPixelData = (row: number, col: number) => {
        if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
          return { r: 0, g: 0, b: 0, a: 0 };
        }
        const index = (row * boardSize + col) * 4;
        return {
          r: data[index],
          g: data[index + 1],
          b: data[index + 2],
          a: data[index + 3]
        };
      };

      // Helper function to check if a pixel is opaque
      const isOpaque = (row: number, col: number): boolean => {
        const pixel = getPixelData(row, col);
        return pixel.a > 128;
      };

      // Helper function to calculate color difference between two pixels
      const colorDifference = (pixel1: { r: number, g: number, b: number, a: number }, 
                               pixel2: { r: number, g: number, b: number, a: number }): number => {
        // If either pixel is transparent, don't calculate color difference
        if (pixel1.a <= 128 || pixel2.a <= 128) {
          return 0;
        }
        
        // Calculate Euclidean distance in RGB space
        const dr = pixel1.r - pixel2.r;
        const dg = pixel1.g - pixel2.g;
        const db = pixel1.b - pixel2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
      };

      // Helper function to check if a pixel has at least one transparent neighbor
      const hasTransparentNeighbor = (row: number, col: number): boolean => {
        const neighbors = [
          [row - 1, col],     // top
          [row + 1, col],     // bottom
          [row, col - 1],     // left
          [row, col + 1],     // right
        ];

        for (const [r, c] of neighbors) {
          if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) {
            // Edge of image counts as transparent neighbor
            return true;
          }
          if (!isOpaque(r, c)) {
            return true;
          }
        }
        return false;
      };

      // Helper function to check if pixel has significant color change with neighbors
      const hasSignificantColorChange = (row: number, col: number): boolean => {
        if (!isOpaque(row, col)) {
          return false;
        }

        const currentPixel = getPixelData(row, col);
        const colorThreshold = 80; // Adjust this value to control sensitivity

        const neighbors = [
          [row - 1, col],     // top
          [row + 1, col],     // bottom
          [row, col - 1],     // left
          [row, col + 1],     // right
        ];

        for (const [r, c] of neighbors) {
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
            const neighborPixel = getPixelData(r, c);
            if (neighborPixel.a > 128) {  // Only compare with opaque neighbors
              const diff = colorDifference(currentPixel, neighborPixel);
              if (diff > colorThreshold) {
                return true;
              }
            }
          }
        }
        return false;
      };

      // Convert image to binary matrix based on contour and color change detection
      for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
          // Mark cell as filled if it's opaque AND (has transparent neighbor OR significant color change)
          if (isOpaque(row, col) && (hasTransparentNeighbor(row, col) || hasSignificantColorChange(row, col))) {
            this.board[row][col] = 1;
          } else {
            this.board[row][col] = 0;
          }
        }
      }
      
      this.cdr.detectChanges();
    };

    img.onerror = () => {
      console.error('Error loading Pokemon image');
    };

    img.src = imageUrl;
  }
}
