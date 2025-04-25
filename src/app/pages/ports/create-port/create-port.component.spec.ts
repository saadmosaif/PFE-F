import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePortComponent } from './create-port.component';

describe('CreatePortComponent', () => {
  let component: CreatePortComponent;
  let fixture: ComponentFixture<CreatePortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePortComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatePortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
