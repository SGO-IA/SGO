import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Apropiacion } from './apropiacion';

describe('Apropiacion', () => {
  let component: Apropiacion;
  let fixture: ComponentFixture<Apropiacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Apropiacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Apropiacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
