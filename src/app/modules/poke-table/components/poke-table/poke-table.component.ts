import { Component, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { PokeTableBoard } from "../poke-table-board/poke-table-board.component";
import { Score } from '../../../shared/components/score/score.component';

@Component({
  selector: 'app-poke-table',
  imports: [MatIconModule, PokeTableBoard, Score],
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

  scoreEventType: 'success' | 'failure' | '' = '';
  scoreEventTick: number = 0;
  showScore: boolean = false;
  gameFinishedState: boolean = false;

  selectMode(mode: string): void {
    this.selectedMode = mode;
    this.modeSelected = true;
    this.showScore = true;
    this.gameFinishedState = false;
  }

  onGameFinished(): void {
    this.gameFinishedState = true;
    this.scoreEventType = 'success';
    this.scoreEventTick++;
  }

  changeMode(): void {
    this.modeSelected = false;
    this.selectedMode = '';
    this.showScore = false;
    this.scoreEventType = '';
    this.gameFinishedState = false;
  }

  reload(): void {
    this.scoreEventType = '';
    this.gameFinishedState = false;
    this.pokeTableBoard.reset();
  }

  return() {
    this.router.navigate(['/main']);
  }
}
