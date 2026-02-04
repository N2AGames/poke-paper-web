import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-main-menu',
  imports: [MatIconModule],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css', '../../../../../styles.css', '../../../shared/styles/buttons.css'],
})
export class MainMenu {
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  navigateTo(path: string): void {
    if (this.isBrowser) {
      this.router.navigate([path]);
    }
  }
}
