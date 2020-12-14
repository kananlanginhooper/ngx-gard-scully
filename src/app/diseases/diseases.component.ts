import { Component, ViewEncapsulation } from '@angular/core';
import { DataService } from '../data.service';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

// @ts-ignore
import * as ListOfDiseases from '../../../src/assets/diseases.legacy.json';


@Component({
  selector: 'app-diseases',
  templateUrl: './diseases.component.html',
  styleUrls: ['./diseases.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiseasesComponent {

  data = [];

  constructor(dataSrv: DataService) {
    this.data = ListOfDiseases.records.map(s => ({ id: s.diseaseId, title: s.diseaseName }));

    // dataSrv.getAll().pipe(take(1)).subscribe(ids => {
    //
    //   // for demo ids are converted to titles // todo:
    //   const proms = ids.map(i => dataSrv.getById(i));
    //   forkJoin(proms).pipe(take(1)).subscribe(rsp => {
    //     this.data = rsp.map(s => ({ id: s.mainPropery.diseaseId, title: s.mainPropery.diseaseName }));
    //   });
    // });
  }
}

