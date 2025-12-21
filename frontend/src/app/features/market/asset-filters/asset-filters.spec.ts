import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetFilters } from './asset-filters';

describe('AssetFilters', () => {
  let component: AssetFilters;
  let fixture: ComponentFixture<AssetFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
