import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReflexionInicial } from './reflexion-inicial';

describe('ReflexionInicial', () => {
  let component: ReflexionInicial;
  let fixture: ComponentFixture<ReflexionInicial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReflexionInicial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReflexionInicial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
