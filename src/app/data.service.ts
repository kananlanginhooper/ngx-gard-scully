import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';

// @ts-ignore
import * as ListOfDiseases from '../assets/diseases.legacy.trimmed.json';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  diseaseRecords = [];

  constructor(private client: HttpClient) {
    this.diseaseRecords = ListOfDiseases.records;
  }

  getRandomData(): Observable<any> {
    const diseaseRecordFilter = this.diseaseRecords[Math.floor(Math.random() * this.diseaseRecords.length)];
    return this.getFromRecord(diseaseRecordFilter);
  }

  getBySlug(slug: string): Observable<any> {
    const diseaseRecordFilter = this.diseaseRecords.filter(disease => disease.EncodedName === slug);
    if (diseaseRecordFilter.length === 1) {
      return this.getFromRecord(diseaseRecordFilter[0]);
    } else {
      // not found by slug, try ID method
      return this.getById(slug);
    }
  }

  getById(id: string | number): Observable<any> {
    const diseaseRecordFilter = this.diseaseRecords.filter(disease => disease.id === +id);
    return this.getFromRecord(diseaseRecordFilter[0]);
  }

  getFromRecord(diseaseRecord: object | any): Observable<any> {
    if (diseaseRecord.detail === undefined) {
      const obs = this.client.get<any>(`/assets/singles/${diseaseRecord.id.toString()}.json`);
      obs.subscribe(detail => {
        diseaseRecord.detail = detail;
      });
      return obs;
    } else {
      return of(diseaseRecord.detail);
    }
  }

  getSearchResults(query: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Ocp-Apim-Subscription-Key': 'b2e8ee0c20be4aeba40366f2bb693e62',
      }),
    };

    return this.client.get<any>(
      `https://api.bing.microsoft.com/v7.0/custom/search?q=${query}&customconfig=2bd8f57f-42a2-49ee-9a80-c9a923b01d23&mkt=en-US&count=50`,
      httpOptions
    );
  }
}
