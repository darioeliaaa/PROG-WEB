import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarMarketComponent } from './sidebarMarket';

describe('SidebarMarket', () => {
  let component: SidebarMarketComponent;
  let fixture: ComponentFixture<SidebarMarketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarMarketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
