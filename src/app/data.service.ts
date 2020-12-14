import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ListOfDiseases } from './diseases';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private client: HttpClient) {}

  getAll(): Observable<any> {
    return of(ListOfDiseases);
  }

  getById(id: string | number): Observable<any> {
    return this.client.get<any>(`/assets/singles/${id.toString()}.json`);
  }

  getSearchResults(query: string): void {
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
