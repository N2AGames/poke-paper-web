import { Component, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { PokeTableBoard } from "../poke-table-board/poke-table-board.component";

@Component({
  selector: 'app-poke-table',
  imports: [MatIconModule, PokeTableBoard],
  templateUrl: './poke-table.component.html',
  styleUrls: ['./poke-table.component.css'],
})
export class PokeTable {

  @ViewChild(PokeTableBoard) pokeTableBoard!: PokeTableBoard;

  constructor(
    private readonly router: Router
  ) {}

  selectedMode: string = 'daily';
  modeSelected: boolean = false;

  openInstructions: boolean = false;

  selectMode(mode: string): void {
    this.selectedMode = mode;
    this.modeSelected = true;
  }

  isGameFinished(): boolean {
    if(this.pokeTableBoard) {
      return this.pokeTableBoard.isGameFinished();
    } else {
      return false;
    }
  }

  changeMode(): void {
    this.modeSelected = false;
    this.selectedMode = '';
  }

  reload(): void {
  }

  return() {
    this.router.navigate(['/main']);
  }
}
