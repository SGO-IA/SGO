import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapsTrabajandoComponent } from './raps-trabajando-component';

describe('RapsTrabajandoComponent', () => {
  let component: RapsTrabajandoComponent;
  let fixture: ComponentFixture<RapsTrabajandoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapsTrabajandoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapsTrabajandoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
