import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokeTable } from './poke-table.component';

describe('PokeTable', () => {
  let component: PokeTable;
  let fixture: ComponentFixture<PokeTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokeTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokeTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
