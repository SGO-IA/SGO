import { TestBed } from '@angular/core/testing';

import { AprendizGeneral } from './aprendiz-general';

describe('AprendizGeneral', () => {
  let service: AprendizGeneral;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AprendizGeneral);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
