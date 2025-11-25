import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Investimenti } from './investimenti';

describe('Investimenti', () => {
  let component: Investimenti;
  let fixture: ComponentFixture<Investimenti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Investimenti]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Investimenti);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
