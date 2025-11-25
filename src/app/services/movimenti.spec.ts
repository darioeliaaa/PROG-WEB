import { TestBed } from '@angular/core/testing';

import { Movimenti } from './movimenti';

describe('Movimenti', () => {
  let service: Movimenti;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Movimenti);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
