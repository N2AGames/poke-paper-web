import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { PicrossBoard } from "../picross-board/picross-board.component";
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-picross',
  imports: [PicrossBoard, MatIconModule],
  templateUrl: './picross.component.html',
  styleUrls: ['./picross.component.css', '../../../../app.css', '../../../shared/styles/buttons.css'],
})
export class Picross {

  selectedMode: string = '10x10';
  modeSelected: boolean = false;

  rows: number = 10;
  cols: number = 10;

  openInstructions: boolean = false;

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

  changeMode(): void {
    this.modeSelected = false;
    this.selectedMode = '';
  }

  return(): void {
    if (this.isBrowser) {
      this.router.navigate(['/main']);
    }
  }
}
