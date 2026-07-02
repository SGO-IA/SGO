import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseContenido } from './fase-contenido';

describe('FaseContenido', () => {
  let component: FaseContenido;
  let fixture: ComponentFixture<FaseContenido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseContenido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseContenido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
