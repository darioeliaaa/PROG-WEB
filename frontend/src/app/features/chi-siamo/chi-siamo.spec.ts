import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChiSiamoComponent } from './chi-siamo'; // Corretto il nome della classe

describe('ChiSiamoComponent', () => {
  let component: ChiSiamoComponent;
  let fixture: ComponentFixture<ChiSiamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChiSiamoComponent] // Deve essere standalone o dichiarato qui
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChiSiamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
