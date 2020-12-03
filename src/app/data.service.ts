import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListOfDiseases } from './diseases';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private client: HttpClient) {
  }

  getAll() {
    return of(ListOfDiseases)
  }

  getById(id: string | number) {
    return this.client.get<any>(`/assets/json/disease${id.toString()}.json`);
  }

}