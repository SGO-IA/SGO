import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntornoOVA } from './entorno-ova';

describe('EntornoOVA', () => {
  let component: EntornoOVA;
  let fixture: ComponentFixture<EntornoOVA>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntornoOVA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntornoOVA);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
