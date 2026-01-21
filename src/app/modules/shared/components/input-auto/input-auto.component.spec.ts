import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputAuto } from './input-auto.component';

describe('InputAuto', () => {
  let component: InputAuto;
  let fixture: ComponentFixture<InputAuto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputAuto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputAuto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
