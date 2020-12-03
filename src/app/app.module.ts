import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ScullyLibModule } from '@scullyio/ng-lib';
import { AboutComponent } from './about/about.component';
import { HelpComponent } from './help/help.component';
import { GlossaryComponent } from './glossary/glossary.component';
import { DiseasesComponent } from './diseases/diseases.component';
import { DiseaseDetailsComponent } from './disease-details/disease-details.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    HelpComponent,
    GlossaryComponent,
    DiseasesComponent,
    DiseaseDetailsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    ScullyLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
