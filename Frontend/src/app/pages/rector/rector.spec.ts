import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rector } from './rector';

describe('Rector', () => {
  let component: Rector;
  let fixture: ComponentFixture<Rector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
