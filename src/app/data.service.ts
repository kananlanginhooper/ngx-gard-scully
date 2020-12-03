import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { list } from './diseases';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private client: HttpClient) {
  }

  getAll() {
    return of(list)
  }

  getById(id: string | number) {
    return this.client.get(`/assets/json/disease${id.toString()}.json`);
  }

}