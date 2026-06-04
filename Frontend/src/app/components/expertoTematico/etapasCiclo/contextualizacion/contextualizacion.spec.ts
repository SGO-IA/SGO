import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contextualizacion } from './contextualizacion';

describe('Contextualizacion', () => {
  let component: Contextualizacion;
  let fixture: ComponentFixture<Contextualizacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contextualizacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Contextualizacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
