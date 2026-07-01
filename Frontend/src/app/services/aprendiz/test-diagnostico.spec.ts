import { TestBed } from '@angular/core/testing';

import { TestDiagnostico } from './test-diagnostico';

describe('TestDiagnostico', () => {
  let service: TestDiagnostico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestDiagnostico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
