import { TestBed } from '@angular/core/testing';

import { CommentaireGeneriqueService } from './commentaire-generique.service';

describe('CommentaireGeneriqueService', () => {
  let service: CommentaireGeneriqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentaireGeneriqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
