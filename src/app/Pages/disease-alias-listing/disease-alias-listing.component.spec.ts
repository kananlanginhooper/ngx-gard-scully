import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseAliasListingComponent } from './disease-alias-listing.component';

describe('DiseaseAliasListingComponent', () => {
  let component: DiseaseAliasListingComponent;
  let fixture: ComponentFixture<DiseaseAliasListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiseaseAliasListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiseaseAliasListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
