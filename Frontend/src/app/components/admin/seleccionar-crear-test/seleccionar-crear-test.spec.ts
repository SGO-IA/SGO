import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionarCrearTest } from './seleccionar-crear-test';

describe('SeleccionarCrearTest', () => {
  let component: SeleccionarCrearTest;
  let fixture: ComponentFixture<SeleccionarCrearTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionarCrearTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionarCrearTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
