import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlipCard } from './flip-card';

describe('FlipCard', () => {
  let component: FlipCard;
  let fixture: ComponentFixture<FlipCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlipCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlipCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
