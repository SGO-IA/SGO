import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisarOvas } from './revisar-ovas';

describe('RevisarOvas', () => {
  let component: RevisarOvas;
  let fixture: ComponentFixture<RevisarOvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisarOvas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisarOvas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
