import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketHome } from './market-home';

describe('MarketHome', () => {
  let component: MarketHome;
  let fixture: ComponentFixture<MarketHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
