import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { PicrossBoard } from "../picross-board/picross-board.component";
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-picross',
  imports: [PicrossBoard, MatIconModule],
  templateUrl: './picross.component.html',
  styleUrls: ['./picross.component.css'],
})
export class Picross {

  @ViewChild(PicrossBoard) picrossBoard!: PicrossBoard;

  selectedMode: string = '10x10';
  modeSelected: boolean = false;

  rows: number = 10;
  cols: number = 10;

  openInstructions: boolean = false;

  action: string = 'guess'; // 'guess' o 'mark'

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private readonly router: Router) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  selectMode(mode: string): void {
    this.selectedMode = mode;
    this.modeSelected = true;

    const dimensions = mode.split('x');
    this.rows = parseInt(dimensions[0]);
    this.cols = parseInt(dimensions[1]);
    this.cdr.markForCheck();
  }

  changeAction(action: string) {
    this.action = action;
  }

  reset(): void {
    this.picrossBoard.resetBoard();
  }

  reload(): void {
    this.picrossBoard.reloadBoard();
  }

  changeMode(): void {
    this.modeSelected = false;
    this.selectedMode = '';
  }

  isGameFinished(): boolean {
    if(this.picrossBoard) {
      return this.picrossBoard.isGameFinished();
    } else {
      return false;
    }
  }

  get lives(): boolean[] {
    const totalLives = this.picrossBoard?.max_lives ?? 3;
    const remainingLives = Math.max(0, Math.min(totalLives, this.picrossBoard?.lives ?? totalLives));
    return Array.from({ length: totalLives }, (_, index) => index < remainingLives);
  }

  return(): void {
    if (this.isBrowser) {
      this.router.navigate(['/main']);
    }
  }
}
