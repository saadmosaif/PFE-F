import { TestBed } from '@angular/core/testing';

import { NavireService } from './navire.service';

describe('NavireService', () => {
  let service: NavireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
