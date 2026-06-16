import { TestBed } from '@angular/core/testing';

import { Semillas } from './semillas';

describe('Semillas', () => {
  let service: Semillas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Semillas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
