import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDeclarationsComponent } from './list-declarations.component';

describe('ListDeclarationsComponent', () => {
  let component: ListDeclarationsComponent;
  let fixture: ComponentFixture<ListDeclarationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDeclarationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListDeclarationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
