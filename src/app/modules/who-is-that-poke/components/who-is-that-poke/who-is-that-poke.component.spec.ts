import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhoIsThatPoke } from './who-is-that-poke.component';

describe('WhoIsThatPoke', () => {
  let component: WhoIsThatPoke;
  let fixture: ComponentFixture<WhoIsThatPoke>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhoIsThatPoke]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhoIsThatPoke);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
