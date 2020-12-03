import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { DiseaseDetailsComponent } from './disease-details/disease-details.component';
import { DiseasesComponent } from './diseases/diseases.component';
import { GlossaryComponent } from './glossary/glossary.component';
import { HelpComponent } from './help/help.component';

const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'help', component: HelpComponent },
  { path: 'glossary', component: GlossaryComponent },
  { path: 'diseases', component: DiseasesComponent },
  { path: 'diseases/:id', component: DiseaseDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
