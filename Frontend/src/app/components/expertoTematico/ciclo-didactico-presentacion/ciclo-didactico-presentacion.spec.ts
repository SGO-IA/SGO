import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CicloDidacticoPresentacion } from './ciclo-didactico-presentacion';

describe('CicloDidacticoPresentacion', () => {
  let component: CicloDidacticoPresentacion;
  let fixture: ComponentFixture<CicloDidacticoPresentacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CicloDidacticoPresentacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CicloDidacticoPresentacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
