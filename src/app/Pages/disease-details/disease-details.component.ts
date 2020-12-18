import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {take} from 'rxjs/operators';
import {DataService} from '../../data.service';

@Component({
  selector: 'app-disease-details',
  templateUrl: './disease-details.component.html',
  styleUrls: ['./disease-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiseaseDetailsComponent {

  data = {mainPropery: null};

  constructor(dataSrv: DataService, activatedRoute: ActivatedRoute) {
    activatedRoute.params.subscribe(param => {
      const diseaseId = +param.id;
      dataSrv.getById(diseaseId).pipe(take(1)).subscribe(diseaseDetail => {
        // console.log(`nav to:`, diseaseDetail.mainPropery.diseaseId);
        this.data = diseaseDetail;
      });
    });

  }

}
