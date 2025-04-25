import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPortsComponent } from './list-ports.component';

describe('ListPortsComponent', () => {
  let component: ListPortsComponent;
  let fixture: ComponentFixture<ListPortsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPortsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListPortsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
