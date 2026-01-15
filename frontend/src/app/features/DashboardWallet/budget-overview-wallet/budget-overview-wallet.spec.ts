import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetOverviewWallet } from './budget-overview-wallet';

describe('BudgetOverview', () => {
  let component: BudgetOverviewWallet;
  let fixture: ComponentFixture<BudgetOverviewWallet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetOverviewWallet]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BudgetOverviewWallet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
