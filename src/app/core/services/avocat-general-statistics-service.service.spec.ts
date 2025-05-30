import { TestBed } from '@angular/core/testing';

import { AvocatGeneralStatisticsServiceService } from './avocat-general-statistics-service.service';

describe('AvocatGeneralStatisticsServiceService', () => {
  let service: AvocatGeneralStatisticsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvocatGeneralStatisticsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
