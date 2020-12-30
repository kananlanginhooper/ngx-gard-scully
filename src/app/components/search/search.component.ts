import {Component} from '@angular/core';
import {Router} from '@angular/router';

// @ts-ignore
import * as ListOfDiseases from '../../../../src/assets/diseases.legacy.trimmed.json';

// @ts-ignore
import * as ListOfDiseaseAlias from '../../../../src/assets/diseases.legacy.alias.json';

class DiseaseListing {
  Search: string;
  UrlBase: string;
  UrlOtherName: string;

  constructor(Search: string, UrlBase: string, UrlOtherName: string) {
    this.Search = Search;
    this.UrlBase = UrlBase;
    this.UrlOtherName = UrlOtherName;
  }

  getRouting(): string[] {
    if (this.UrlOtherName) {
      return ['/diseases', this.UrlBase, 'OtherNames', this.UrlOtherName]; // too many pages to render right now
      // return ['/diseases', this.UrlBase, 'OtherNames'];
    } else {
      return ['/diseases', this.UrlBase];
    }
  }
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {

  text: string;
  results: DiseaseListing[];
  diseaseData = [];

  constructor(private router: Router) {
    this.diseaseData = ListOfDiseases.records;
  }

  autoSearch(event): void {
    this.searchFromString(event.query);
  }

  bingSearch(): void {
    this.router.navigate(['/search'], {
      queryParams: {query: this.text},
    }).then();
  }

  searchFromString(SearchString: string): void {
    // reset search
    this.results = [];

    // do the search
    this.diseaseData.forEach(disease => {
      if (disease.name.includes(SearchString)) {
        this.results.push(new DiseaseListing(disease.name, disease.EncodedName, ''));
      }
    });

    ListOfDiseaseAlias.alias.forEach(diseaseAlias => {
      if (diseaseAlias.alias.includes(SearchString)) {
        this.results.push(new DiseaseListing(diseaseAlias.alias, diseaseAlias.EncodedName, diseaseAlias.EncodedAlias));
      }
    });

  }

  onSelect(event: DiseaseListing): void {
    this.router.navigate(event.getRouting()).then(() => {
      this.text = '';
      this.results = [];
    });
  }


}
