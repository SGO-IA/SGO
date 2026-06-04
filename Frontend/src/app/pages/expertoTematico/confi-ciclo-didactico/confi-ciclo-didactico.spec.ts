import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiCicloDidactico } from './confi-ciclo-didactico';

describe('ConfiCicloDidactico', () => {
  let component: ConfiCicloDidactico;
  let fixture: ComponentFixture<ConfiCicloDidactico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiCicloDidactico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiCicloDidactico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
