import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CicloDidactico } from './ciclo-didactico';

describe('CicloDidactico', () => {
  let component: CicloDidactico;
  let fixture: ComponentFixture<CicloDidactico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CicloDidactico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CicloDidactico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
