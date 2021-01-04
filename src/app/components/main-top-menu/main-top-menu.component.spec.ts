import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainTopMenuComponent } from './main-top-menu.component';

describe('MainTopMenuComponent', () => {
  let component: MainTopMenuComponent;
  let fixture: ComponentFixture<MainTopMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainTopMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainTopMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
