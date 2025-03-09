import { TestBed } from '@angular/core/testing';

import { VocabulaireService } from './vocabulaire.service';

describe('VocabulaireService', () => {
  let service: VocabulaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VocabulaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
