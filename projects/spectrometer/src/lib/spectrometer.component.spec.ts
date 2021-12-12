import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectrometerComponent } from './spectrometer.component';

describe('SpectrometerComponent', () => {
  let component: SpectrometerComponent;
  let fixture: ComponentFixture<SpectrometerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpectrometerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpectrometerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
