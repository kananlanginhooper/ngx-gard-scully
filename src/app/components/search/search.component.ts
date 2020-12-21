import {Component, OnInit} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

// @ts-ignore
import * as ListOfDiseases from '../../../../src/assets/diseases.legacy.trimmed.json';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  text: string;
  results: object[];
  diseaseData = [];

  constructor(private router: Router) {
    this.diseaseData = ListOfDiseases.records;
  }

  ngOnInit(): void {
  }

  autoSearch(event): void {
    this.searchFromString(event.query);
  }

  bingSearch(): void {
    this.router.navigate(['/search'], {
      queryParams: { query: this.text },
    }).then();
  }

  searchFromString(SearchString: string): void {
    // reset search
    this.results = [];

    // do the search
    this.diseaseData.forEach(disease => {
      if (disease.name.includes(SearchString)) {
        this.results.push(disease);
      }
    });

  }

  onSelect(event): void {
    this.text = '';
    this.results = [];
    this.router.navigate(['/diseases', event.id]).then();
  }


}
