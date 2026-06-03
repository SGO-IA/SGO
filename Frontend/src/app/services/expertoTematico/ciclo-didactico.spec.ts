import { TestBed } from '@angular/core/testing';

import { CicloDidactico } from './ciclo-didactico';

describe('CicloDidactico', () => {
  let service: CicloDidactico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CicloDidactico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
