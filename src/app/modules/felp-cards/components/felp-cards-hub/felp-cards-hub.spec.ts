import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FelpCardsHub } from './felp-cards-hub';

describe('FelpCardsHub', () => {
  let component: FelpCardsHub;
  let fixture: ComponentFixture<FelpCardsHub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FelpCardsHub]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FelpCardsHub);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
