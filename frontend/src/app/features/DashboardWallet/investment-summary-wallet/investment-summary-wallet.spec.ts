import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentSummaryWallet } from './investment-summary-wallet';

describe('InvestmentSummary', () => {
  let component: InvestmentSummaryWallet;
  let fixture: ComponentFixture<InvestmentSummaryWallet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentSummaryWallet]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InvestmentSummaryWallet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

