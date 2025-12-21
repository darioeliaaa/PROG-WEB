import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentSummary } from './investment-summary';

describe('InvestmentSummary', () => {
  let component: InvestmentSummary;
  let fixture: ComponentFixture<InvestmentSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestmentSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
