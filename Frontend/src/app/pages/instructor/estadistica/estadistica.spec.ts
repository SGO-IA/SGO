import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Estadistica } from './estadistica';

describe('Estadistica', () => {
  let component: Estadistica;
  let fixture: ComponentFixture<Estadistica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Estadistica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Estadistica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
