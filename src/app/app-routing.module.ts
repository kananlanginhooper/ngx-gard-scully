import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { DiseaseDetailsComponent } from './disease-details/disease-details.component';
import { DiseasesComponent } from './diseases/diseases.component';
import { EspanolComponent } from './espanol/espanol.component';
import { GlossaryComponent } from './glossary/glossary.component';
import { HelpComponent } from './help/help.component';
import { SearchResultsComponent } from './search-results/search-results.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'diseases',
    pathMatch: 'full',
  },
  { path: 'about', component: AboutComponent },
  { path: 'help', component: HelpComponent },
  { path: 'news', component: GlossaryComponent },
  { path: 'diseases', component: DiseasesComponent },
  { path: 'diseases/:id', component: DiseaseDetailsComponent },
  { path: 'search', component: SearchResultsComponent },
  { path: 'espanol', component: EspanolComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
