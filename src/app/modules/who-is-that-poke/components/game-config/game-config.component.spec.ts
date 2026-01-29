import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameConfig } from './game-config.component';

describe('GameConfig', () => {
  let component: GameConfig;
  let fixture: ComponentFixture<GameConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameConfig);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
