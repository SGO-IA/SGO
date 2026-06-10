import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapsDisponiblesComponent } from './raps-disponibles-component';

describe('RapsDisponiblesComponent', () => {
  let component: RapsDisponiblesComponent;
  let fixture: ComponentFixture<RapsDisponiblesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapsDisponiblesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapsDisponiblesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
