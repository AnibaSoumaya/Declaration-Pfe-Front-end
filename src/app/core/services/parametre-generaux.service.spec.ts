import { TestBed } from '@angular/core/testing';

import { ParametreGenerauxService } from './parametre-generaux.service';

describe('ParametreGenerauxService', () => {
  let service: ParametreGenerauxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParametreGenerauxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
