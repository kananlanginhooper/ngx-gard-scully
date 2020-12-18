import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseSubMenuComponent } from './disease-sub-menu.component';

describe('DiseaseSubMenuComponent', () => {
  let component: DiseaseSubMenuComponent;
  let fixture: ComponentFixture<DiseaseSubMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiseaseSubMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiseaseSubMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
