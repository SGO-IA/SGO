import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearFicha } from './crear-ficha';

describe('CrearFicha', () => {
  let component: CrearFicha;
  let fixture: ComponentFixture<CrearFicha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearFicha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearFicha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
