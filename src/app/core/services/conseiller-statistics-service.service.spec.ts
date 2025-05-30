import { TestBed } from '@angular/core/testing';

import { ConseillerStatisticsServiceService } from './conseiller-statistics-service.service';

describe('ConseillerStatisticsServiceService', () => {
  let service: ConseillerStatisticsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConseillerStatisticsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
