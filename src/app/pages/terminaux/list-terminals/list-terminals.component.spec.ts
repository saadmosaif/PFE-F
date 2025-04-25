import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTerminalsComponent } from './list-terminals.component';

describe('ListTerminalsComponent', () => {
  let component: ListTerminalsComponent;
  let fixture: ComponentFixture<ListTerminalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTerminalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListTerminalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
