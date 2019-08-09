import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCatComponent } from './searchcat.component';

describe('SearchCatComponent', () => {
  let component: SearchCatComponent;
  let fixture: ComponentFixture<SearchCatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchCatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchCatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
