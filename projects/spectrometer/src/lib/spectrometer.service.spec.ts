import { TestBed } from '@angular/core/testing';

import { SpectrometerService } from './spectrometer.service';

describe('SpectrometerService', () => {
  let service: SpectrometerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpectrometerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
