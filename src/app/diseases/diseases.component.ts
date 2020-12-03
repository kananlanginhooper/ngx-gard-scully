import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-diseases',
  templateUrl: './diseases.component.html',
  styleUrls: ['./diseases.component.scss']
})
export class DiseasesComponent {

  data: number[] = [];

  constructor(dataSrv: DataService) {
    dataSrv.getAll().pipe(take(1)).subscribe(d => this.data = d)
  }


}
