import { TestBed } from '@angular/core/testing';

import { AdminstatService } from './adminstat.service';

describe('AdminstatService', () => {
  let service: AdminstatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminstatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
