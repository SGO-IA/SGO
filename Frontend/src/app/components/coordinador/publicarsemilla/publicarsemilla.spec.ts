import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Publicarsemilla } from './publicarsemilla';

describe('Publicarsemilla', () => {
  let component: Publicarsemilla;
  let fixture: ComponentFixture<Publicarsemilla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Publicarsemilla]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Publicarsemilla);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
