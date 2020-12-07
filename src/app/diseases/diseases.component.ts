import { Component, ViewEncapsulation } from '@angular/core';
import { DataService } from '../data.service';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-diseases',
  templateUrl: './diseases.component.html',
  styleUrls: ['./diseases.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiseasesComponent {

  data = [];

  constructor(dataSrv: DataService) {
    dataSrv.getAll().pipe(take(1)).subscribe(ids => {

      // for demo ids are converted to titles // todo:
      const proms = ids.map(i => dataSrv.getById(i));
      forkJoin(proms).pipe(take(1)).subscribe(rsp => {
        this.data = rsp.map(s => ({ id: s.mainPropery.diseaseId, title: s.mainPropery.diseaseName }));
      });
    });
  }
}
