import { TestBed } from '@angular/core/testing';

import { WalletComponent } from './wallet';

describe('Wallet', () => {
  let service: WalletComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
