import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PicrossBoardData, PicrossCellData } from '../../../shared/models/picross-board-data.model';

@Component({
  selector: 'picross-board',
  imports: [],
  templateUrl: './picross-board.component.html',
  styleUrls: ['./picross-board.component.css', '../../../../app.css', '../../../shared/styles/buttons.css'],
})
export class PicrossBoard implements OnChanges {

  @Input() rows: number = 5;
  @Input() columns: number = 5;

  board: PicrossBoardData = { rows: [], rowClues: [], columnClues: [] };

  constructor() {
    this.loadBoard();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows'] || changes['columns']) {
      this.loadBoard();
    }
  }

  loadBoard() {
    this.board = { rows: [], rowClues: [], columnClues: [] };
    for (let i = 0; i < this.rows; i++) {
      const row = { cells: [] as PicrossCellData[]};
      for (let j = 0; j < this.columns; j++) {
        row.cells.push({ color: 'white', enabled: true, pushed: false });
      }
      this.board.rows.push(row);
    }

    // Generate random clues for each row
    for (let i = 0; i < this.rows; i++) {
      this.board.rowClues.push(this.generateClues());
    }

    // Generate random clues for each column
    for (let i = 0; i < this.columns; i++) {
      this.board.columnClues.push(this.generateClues());
    }
  }

  private generateClues(): number[] {
    const clueCount = Math.floor(Math.random() * 3) + 1;
    const clues: number[] = [];
    for (let i = 0; i < clueCount; i++) {
      clues.push(Math.floor(Math.random() * 5) + 1);
    }
    return clues;
  }
}
