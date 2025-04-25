import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateShipComponent } from './create-ship.component';

describe('CreateShipComponent', () => {
  let component: CreateShipComponent;
  let fixture: ComponentFixture<CreateShipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateShipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateShipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
