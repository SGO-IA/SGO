import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDiagnostico } from './test-diagnostico';

describe('TestDiagnostico', () => {
  let component: TestDiagnostico;
  let fixture: ComponentFixture<TestDiagnostico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDiagnostico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestDiagnostico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
