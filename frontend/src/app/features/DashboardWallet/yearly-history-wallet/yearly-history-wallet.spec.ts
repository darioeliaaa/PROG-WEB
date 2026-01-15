import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyHistoryWallet } from './yearly-history-wallet';

describe('YearlyHistory', () => {
  let component: YearlyHistoryWallet;
  let fixture: ComponentFixture<YearlyHistoryWallet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlyHistoryWallet]
    })
      .compileComponents();

    fixture = TestBed.createComponent(YearlyHistoryWallet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

