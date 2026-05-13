import { TestBed } from '@angular/core/testing';

import { ExpertoService } from './experto-service';

describe('ExpertoService', () => {
  let service: ExpertoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpertoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
