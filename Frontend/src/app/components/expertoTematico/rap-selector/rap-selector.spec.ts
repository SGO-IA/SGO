import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapSelector } from './rap-selector';

describe('RapSelector', () => {
  let component: RapSelector;
  let fixture: ComponentFixture<RapSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
