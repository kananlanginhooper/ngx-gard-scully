import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseAliasComponent } from './disease-alias.component';

describe('DiseaseAliasComponent', () => {
  let component: DiseaseAliasComponent;
  let fixture: ComponentFixture<DiseaseAliasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiseaseAliasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiseaseAliasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
