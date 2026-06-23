import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fichas } from './fichas';

describe('Fichas', () => {
  let component: Fichas;
  let fixture: ComponentFixture<Fichas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fichas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fichas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
