import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Entorno } from './entorno';

describe('Entorno', () => {
  let component: Entorno;
  let fixture: ComponentFixture<Entorno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Entorno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Entorno);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
