import { TestBed } from '@angular/core/testing';

import { Fichas } from './fichas';

describe('Fichas', () => {
  let service: Fichas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fichas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
