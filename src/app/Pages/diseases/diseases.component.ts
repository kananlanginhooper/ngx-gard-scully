import {Component, ViewEncapsulation} from '@angular/core';
import {DataService} from '../../data.service';
import {take} from 'rxjs/operators';
import {forkJoin} from 'rxjs';

// @ts-ignore
import * as ListOfDiseases from '../../../assets/diseases.trimmed.json';


@Component({
  selector: 'app-diseases',
  templateUrl: './diseases.component.html',
  styleUrls: ['./diseases.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiseasesComponent {

  data = [];
  // headers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  headers = [];

  constructor(dataSrv: DataService) {
    this.data = ListOfDiseases.records;

    // Build Headers -- https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates#answer-33121880
    this.headers = [...new Set(this.data.map(record => record.name.substring(0, 1).toUpperCase()))];

    // dataSrv.getAll().pipe(take(1)).subscribe(ids => {
    //
    //   // for demo ids are converted to titles // todo:
    //   const proms = ids.map(i => dataSrv.getById(i));
    //   forkJoin(proms).pipe(take(1)).subscribe(rsp => {
    //     this.data = rsp.map(s => ({ id: s.mainPropery.diseaseId, title: s.mainPropery.diseaseName }));
    //   });
    // });
  }


  getByLetter(letter: string | number): object[] {
    const ret = this.data.filter(record => record.name.substring(0, 1).toUpperCase() === `${letter}`);
    return ret;
  }

  scrollToView($event: any, id: string): void {
    $event.stopPropagation();
    $event.preventDefault();
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView(); // scroll to a particular element
    }
  }
}
