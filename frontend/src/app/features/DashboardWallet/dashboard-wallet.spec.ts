import { TestBed } from '@angular/core/testing';

import { DashboardWallet } from './dashboard-wallet';

describe('DashboardWallet', () => {
  let service: DashboardWallet;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardWallet);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
