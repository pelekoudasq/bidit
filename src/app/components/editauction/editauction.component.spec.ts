import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAuctionComponent } from './editauction.component';

describe('EditAuctionComponent', () => {
  let component: EditAuctionComponent;
  let fixture: ComponentFixture<EditAuctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAuctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAuctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
