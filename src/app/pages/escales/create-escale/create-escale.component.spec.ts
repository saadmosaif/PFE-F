import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEscaleComponent } from './create-escale.component';

describe('CreateEscaleComponent', () => {
  let component: CreateEscaleComponent;
  let fixture: ComponentFixture<CreateEscaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEscaleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateEscaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
