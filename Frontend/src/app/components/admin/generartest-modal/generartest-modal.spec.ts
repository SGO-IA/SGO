import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerartestModal } from './generartest-modal';

describe('GenerartestModal', () => {
  let component: GenerartestModal;
  let fixture: ComponentFixture<GenerartestModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerartestModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerartestModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
