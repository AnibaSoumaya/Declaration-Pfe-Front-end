import { TestBed } from '@angular/core/testing';

import { gestionAssujettiService } from './gestion-assujetti.service';

describe('GestionAssujettiService', () => {
  let service: gestionAssujettiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(gestionAssujettiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
