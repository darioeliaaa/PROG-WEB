import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyHistory } from './yearly-history';

describe('YearlyHistory', () => {
  let component: YearlyHistory;
  let fixture: ComponentFixture<YearlyHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlyHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearlyHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
