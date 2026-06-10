import { TestBed } from '@angular/core/testing';

import { R2Cloudflare } from './r2-cloudflare';

describe('R2Cloudflare', () => {
  let service: R2Cloudflare;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(R2Cloudflare);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
