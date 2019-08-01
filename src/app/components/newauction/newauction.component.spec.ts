import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAuctionComponent } from './newauction.component';

describe('NewAuctionComponent', () => {
  let component: NewAuctionComponent;
  let fixture: ComponentFixture<NewAuctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewAuctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAuctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
