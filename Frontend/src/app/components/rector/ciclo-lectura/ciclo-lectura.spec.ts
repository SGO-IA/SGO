import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CicloLectura } from './ciclo-lectura';

describe('CicloLectura', () => {
  let component: CicloLectura;
  let fixture: ComponentFixture<CicloLectura>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CicloLectura]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CicloLectura);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
