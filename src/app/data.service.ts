import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListOfDiseases } from './diseases';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private client: HttpClient) {
  }

  getAll(): Observable<any> {
    return of(ListOfDiseases);
  }

  getById(id: string | number): Observable<any> {
    return this.client.get<any>(`/assets/singles/${id.toString()}.json`);
  }

}
