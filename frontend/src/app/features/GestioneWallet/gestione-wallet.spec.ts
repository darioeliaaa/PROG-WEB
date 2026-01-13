import { TestBed } from '@angular/core/testing';

import { GestioneWallet } from './gestione-wallet';

describe('GestioneWallet', () => {
  let service: GestioneWallet;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestioneWallet);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
