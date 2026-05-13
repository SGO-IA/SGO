import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSemillaComponents } from './crear-semilla-components';

describe('CrearSemillaComponents', () => {
  let component: CrearSemillaComponents;
  let fixture: ComponentFixture<CrearSemillaComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearSemillaComponents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearSemillaComponents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
