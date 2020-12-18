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

  search(event): void {
    // reset search
    this.results = [];

    // do the search
    this.diseaseData.forEach(disease => {
      if (disease.name.includes(event.query)) {
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
