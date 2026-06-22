import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRevisionSemillas } from './modal-revision-semillas';

describe('ModalRevisionSemillas', () => {
  let component: ModalRevisionSemillas;
  let fixture: ComponentFixture<ModalRevisionSemillas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRevisionSemillas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRevisionSemillas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
