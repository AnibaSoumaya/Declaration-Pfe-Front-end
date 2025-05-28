import { TestBed } from '@angular/core/testing';

import { PgstatService } from './pgstat.service';

describe('PgstatService', () => {
  let service: PgstatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PgstatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
