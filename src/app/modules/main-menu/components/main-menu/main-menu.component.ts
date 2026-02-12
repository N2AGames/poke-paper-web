import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-main-menu',
  imports: [MatIconModule],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
})
export class MainMenu {
  private isBrowser: boolean;
  
  isMobile: boolean = false;
  isPortrait: boolean = false;
  isLargeScreen: boolean = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Detect mobile devices based on screen width (you can adjust the threshold as needed)
    if (this.isBrowser) {
      this.isMobile = window.innerWidth <= 768; // Example threshold for mobile devices
      this.updateOrientationState();
      
      // Listen to orientation changes
      window.addEventListener('orientationchange', () => this.updateOrientationState());
      window.addEventListener('resize', () => this.updateOrientationState());
    }
  }
  
  private updateOrientationState(): void {
    if (this.isBrowser) {
      this.isPortrait = window.innerHeight > window.innerWidth;
      // Picross requiere pantalla grande (ancho > 1024px) en landscape
      this.isLargeScreen = window.innerWidth > 1024 && !this.isPortrait;
    }
  }

  navigateTo(path: string): void {
    if (this.isBrowser) {
      this.router.navigate([path]);
    }
  }
}
