import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap, map } from 'rxjs/operators';
import { DataService } from '../data.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnInit {
  query = '';
  searchResults = [];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    let searchResultsToProcess = [];
    this.route.queryParams
      .pipe(
        concatMap((params) => {
          this.query = params['query'];
          return this.dataService.getSearchResults(this.query).pipe();
        })
      )
      .subscribe((searchData) => {
        if (searchData.webPages.value && searchData.webPages.value.length > 0) {
          searchResultsToProcess = searchData.webPages.value;
          searchResultsToProcess = searchResultsToProcess.map((result) => {
            let url = result.url;
            url = url.replace('https://', '');
            let splitUrl = url.split('/');
            const parsed = Number.parseInt(splitUrl[2]);
            if (!Number.isNaN(parsed)) {
              if (result.name.indexOf('|') > -1) {
                result.name = result.name.substr(0, result.name.indexOf('|'));
                result.EncodedName = encodeURI(result.name.trim().replace(/ /g, '_').replace(/:/g, '_').replace(/\//g, '_'));
                result.diseaseId = parsed;
              }
              return result;
            }
          });
          this.searchResults = searchResultsToProcess.filter((x) => x);
        }
      });
  }
}
