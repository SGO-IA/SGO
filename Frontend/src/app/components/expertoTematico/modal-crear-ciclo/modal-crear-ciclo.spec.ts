import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearCiclo } from './modal-crear-ciclo';

describe('ModalCrearCiclo', () => {
  let component: ModalCrearCiclo;
  let fixture: ComponentFixture<ModalCrearCiclo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCrearCiclo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCrearCiclo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
