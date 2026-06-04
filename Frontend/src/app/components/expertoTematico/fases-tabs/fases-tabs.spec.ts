import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FasesTabs } from './fases-tabs';

describe('FasesTabs', () => {
  let component: FasesTabs;
  let fixture: ComponentFixture<FasesTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FasesTabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FasesTabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
