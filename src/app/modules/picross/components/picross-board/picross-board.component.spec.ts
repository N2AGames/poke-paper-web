import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PicrossBoard } from './picross-board';

describe('PicrossBoard', () => {
  let component: PicrossBoard;
  let fixture: ComponentFixture<PicrossBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PicrossBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PicrossBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
