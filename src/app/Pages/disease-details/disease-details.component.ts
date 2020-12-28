import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {take} from 'rxjs/operators';
import {DataService} from '../../data.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-disease-details',
  templateUrl: './disease-details.component.html',
  styleUrls: ['./disease-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiseaseDetailsComponent {

  data = {mainPropery: null};

  constructor(
    dataSrv: DataService,
    activatedRoute: ActivatedRoute,
    private title: Title,
    private meta: Meta
  ) {
    activatedRoute.params.subscribe(param => {
      const diseaseId = +param.id;
      dataSrv.getById(diseaseId).pipe(take(1)).subscribe(diseaseDetail => {
        // console.log(`nav to:`, diseaseDetail.mainPropery.diseaseId);
        this.data = diseaseDetail;

        debugger;

        // Website Title
        this.title.setTitle(diseaseDetail.mainPropery.diseaseName);

        // Keywords
        const arrKeywords = [];
        arrKeywords.push(diseaseDetail.mainPropery.diseaseName);
        arrKeywords.push(diseaseDetail.mainPropery.synonyms);

        // Description
        let description = '';
        description += `${diseaseDetail.mainPropery.diseaseName} is a `;

        if (diseaseDetail.mainPropery.isRare) {
          description += `rare `;
        }else{
          description += `genetic `;
        }
        description += `disease that is also know by the following names: `;
        description += `${diseaseDetail.mainPropery.synonyms.join(', ')}. `;

        description += `It is in the categories of: `;
        description += `${diseaseDetail.diseaseCategories.map(cat => cat.diseaseTypeName).join(', ')}. `;

        this.meta.addTags([
          {name: 'keywords', content: arrKeywords.join(', ')},
          {name: 'description', content: description},
          {name: 'robots', content: 'index, follow'}
        ]);
      });
    });

  }

}
