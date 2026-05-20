import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarExpertos } from './listar-expertos';

describe('ListarExpertos', () => {
  let component: ListarExpertos;
  let fixture: ComponentFixture<ListarExpertos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarExpertos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarExpertos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
