import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicarSemillas } from './publicar-semillas';

describe('PublicarSemillas', () => {
  let component: PublicarSemillas;
  let fixture: ComponentFixture<PublicarSemillas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarSemillas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicarSemillas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
