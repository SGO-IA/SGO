import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleSemillaComponent } from './detalle-semilla-component';

describe('DetalleSemillaComponent', () => {
  let component: DetalleSemillaComponent;
  let fixture: ComponentFixture<DetalleSemillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleSemillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleSemillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
