import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { GameInfo } from '../../models/game-info.model';
import { Utils } from '../../utils';

@Component({
  selector: 'app-score',
  imports: [TitleCasePipe],
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.css', '../../../../../styles.css'],
})
export class Score {

  gameInfo: GameInfo;
  private isBrowser: boolean;

  @Input() mode: string = '1gen';

  showScore: boolean = false;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      const gameInfo = localStorage.getItem('who-is-that-poke-game-info');
      if(gameInfo) {
        try {
          const parsedData = JSON.parse(gameInfo);
          this.gameInfo = this.mapToGameInfo(parsedData);
          console.log('Loaded from localStorage:', this.gameInfo);
        } catch (error) {
          console.error('Error parsing localStorage:', error);
          this.gameInfo = this.initializeSaveData();
        }
      } else {
        this.gameInfo = this.initializeSaveData();
      }
    } else {
      // Initialize with default values for SSR
      this.gameInfo = this.initializeSaveData();
    }
  }

  private mapToGameInfo(data: any): GameInfo {
    const guessed = new Map<string, number>();
    const tries = new Map<string, number>();
    
    // Convertir los valores a números correctamente
    if (data.guessed) {
      Object.entries(data.guessed).forEach(([key, value]: [string, any]) => {
        guessed.set(key, Number(value) || 0);
      });
    }
    
    if (data.tries) {
      Object.entries(data.tries).forEach(([key, value]: [string, any]) => {
        tries.set(key, Number(value) || 0);
      });
    }
    
    return new GameInfo(guessed, tries);
  }

  sumSucess(mode: string = '1gen') {
    console.log('sumSucess called with mode:', mode);
    this.gameInfo.guessed.set(mode, (this.gameInfo.guessed.get(mode) || 0) + 1);
    this.gameInfo.tries.set(mode, (this.gameInfo.tries.get(mode) || 0) + 1);
    if (this.isBrowser) {
      try {
        const dataToSave = {
          guessed: Object.fromEntries(this.gameInfo.guessed),
          tries: Object.fromEntries(this.gameInfo.tries)
        };
        localStorage.setItem('who-is-that-poke-game-info', JSON.stringify(dataToSave));
        console.log('Score saved successfully:', dataToSave);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  sumFailure(mode: string = '1gen') {
    console.log('sumFailure called with mode:', mode);
    this.gameInfo.tries.set(mode, (this.gameInfo.tries.get(mode) || 0) + 1);
    if (this.isBrowser) {
      try {
        const dataToSave = {
          guessed: Object.fromEntries(this.gameInfo.guessed),
          tries: Object.fromEntries(this.gameInfo.tries)
        };
        localStorage.setItem('who-is-that-poke-game-info', JSON.stringify(dataToSave));
        console.log('Score saved successfully:', dataToSave);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }
  
  initializeSaveData(): GameInfo {
    this.gameInfo = new GameInfo(new Map<string, number>(), new Map<string, number>());
    for(let mode of Utils.GAME_MODES) {
      this.gameInfo.guessed.set(mode.key, 0);
      this.gameInfo.guessed.set(mode.key + '-DT', 0);
      this.gameInfo.tries.set(mode.key, 0);
      this.gameInfo.tries.set(mode.key + '-DT', 0);
    }
    if (this.isBrowser) {
      try {
        const dataToSave = {
          guessed: Object.fromEntries(this.gameInfo.guessed),
          tries: Object.fromEntries(this.gameInfo.tries)
        };
        localStorage.setItem('who-is-that-poke-game-info', JSON.stringify(dataToSave));
        console.log('Initial save created:', dataToSave);
      } catch (error) {
        console.error('Error creating initial save:', error);
      }
    }
    return this.gameInfo;
  }
 
  getTextMode(mode: string): string {
    let modeKeys = mode.split('-');
    const foundMode = Utils.GAME_MODES.find(m => m.key === modeKeys[0]);
    return (foundMode ? foundMode.label : mode) + (modeKeys.includes('DT') ? ' Double Trouble' : '');
  }
}
