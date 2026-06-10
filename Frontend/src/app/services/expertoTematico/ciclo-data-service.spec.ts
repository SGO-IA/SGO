import { TestBed } from '@angular/core/testing';

import { CicloDataService } from './ciclo-data-service';

describe('CicloDataService', () => {
  let service: CicloDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CicloDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
