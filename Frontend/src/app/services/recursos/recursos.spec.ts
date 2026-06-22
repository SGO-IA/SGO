import { TestBed } from '@angular/core/testing';

import { Recursos } from './recursos';

describe('Recursos', () => {
  let service: Recursos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Recursos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
