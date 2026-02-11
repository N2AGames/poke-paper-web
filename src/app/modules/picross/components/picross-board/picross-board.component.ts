import { Component, Input } from '@angular/core';
import { PicrossBoardData, PicrossCellData } from '../../../shared/models/picross-board-data.model';

@Component({
  selector: 'picross-board',
  imports: [],
  templateUrl: './picross-board.component.html',
  styleUrls: ['./picross-board.component.css', '../../../../app.css', '../../../shared/styles/buttons.css'],
})
export class PicrossBoard {

  @Input() rows: number = 5;
  @Input() columns: number = 5;

  board: PicrossBoardData = { rows: [] };

  constructor() {
    this.loadBoard();
  }

  loadBoard() {
    for(let i = 0; i < this.rows; i++) {
      const row = { cells: [] as PicrossCellData[]};
      for(let j = 0; j < this.columns; j++) {
        row.cells.push({ color: 'white', enabled: true, pushed: false });
      }
      this.board.rows.push(row);
    }
  }
}
