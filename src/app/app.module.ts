import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ScullyLibModule} from '@scullyio/ng-lib';

import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AboutComponent} from './Pages/about/about.component';
import {HelpComponent} from './Pages/help/help.component';
import {GlossaryComponent} from './Pages/glossary/glossary.component';
import {DiseasesComponent} from './Pages/diseases/diseases.component';
import {DiseaseDetailsComponent} from './Pages/disease-details/disease-details.component';
import {EspanolComponent} from './Pages/espanol/espanol.component';

import {SearchResultsComponent} from './search-results/search-results.component';
import {AutoCompleteModule} from 'primeng/autocomplete';
import { SearchComponent } from './components/search/search.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {DiseaseSubMenuComponent} from './components/disease-sub-menu/disease-sub-menu.component';
import { MainTopMenuComponent } from './components/main-top-menu/main-top-menu.component';
import { SearchBannerComponent } from './components/search-banner/search-banner.component';
import { JsonLdComponent } from './components/json-ld/json-ld.component';
import { FillerComponent } from './Pages/filler/filler.component';


@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    HelpComponent,
    GlossaryComponent,
    DiseasesComponent,
    DiseaseDetailsComponent,
    SearchResultsComponent,
    EspanolComponent,
    SearchComponent,
    DiseaseSubMenuComponent,
    MainTopMenuComponent,
    SearchBannerComponent,
    JsonLdComponent,
    FillerComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    ScullyLibModule.forRoot({
      useTransferState: true,
      alwaysMonitor: true,
    }),
    ReactiveFormsModule,
    AutoCompleteModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
