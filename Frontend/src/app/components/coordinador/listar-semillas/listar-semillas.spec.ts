import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarSemillas } from './listar-semillas';

describe('ListarSemillas', () => {
  let component: ListarSemillas;
  let fixture: ComponentFixture<ListarSemillas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarSemillas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarSemillas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
