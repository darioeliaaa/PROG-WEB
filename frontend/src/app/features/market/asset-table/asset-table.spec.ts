import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetTable } from './asset-table';

describe('AssetTable', () => {
  let component: AssetTable;
  let fixture: ComponentFixture<AssetTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
