import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Picross } from './picross.component';

describe('Picross', () => {
  let component: Picross;
  let fixture: ComponentFixture<Picross>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Picross]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Picross);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
