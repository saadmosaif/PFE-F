import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEscalesComponent } from './list-escales.component';

describe('ListEscalesComponent', () => {
  let component: ListEscalesComponent;
  let fixture: ComponentFixture<ListEscalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListEscalesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListEscalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
