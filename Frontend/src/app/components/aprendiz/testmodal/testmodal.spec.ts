import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Testmodal } from './testmodal';

describe('Testmodal', () => {
  let component: Testmodal;
  let fixture: ComponentFixture<Testmodal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Testmodal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Testmodal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
