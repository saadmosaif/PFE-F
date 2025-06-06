import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListShipsComponent } from './list-ships.component';

describe('ListShipsComponent', () => {
  let component: ListShipsComponent;
  let fixture: ComponentFixture<ListShipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListShipsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListShipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
