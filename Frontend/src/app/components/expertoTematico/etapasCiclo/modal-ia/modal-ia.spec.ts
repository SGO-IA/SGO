import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalIa } from './modal-ia';

describe('ModalIa', () => {
  let component: ModalIa;
  let fixture: ComponentFixture<ModalIa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalIa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalIa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
