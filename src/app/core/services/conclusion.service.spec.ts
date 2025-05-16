import { TestBed } from '@angular/core/testing';

import { ConclusionService } from './conclusion.service';

describe('ConclusionService', () => {
  let service: ConclusionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConclusionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
