import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {take} from 'rxjs/operators';
import {DataService} from '../../data.service';
import {Title, Meta} from '@angular/platform-browser';

@Component({
  selector: 'app-disease-details',
  templateUrl: './disease-details.component.html',
  styleUrls: ['./disease-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiseaseDetailsComponent {

  data = null;
  diseaseSlug = '';

  constructor(
    dataSrv: DataService,
    activatedRoute: ActivatedRoute,
    private title: Title,
    private meta: Meta
  ) {
    activatedRoute.params.subscribe(param => {
      this.diseaseSlug = param.id;
      dataSrv.getBySlug(this.diseaseSlug).pipe(take(1)).subscribe(diseaseDetail => {
        // console.log(`nav to:`, diseaseDetail.mainPropery.diseaseId);
        this.data = diseaseDetail;

        // Website Title
        this.title.setTitle(diseaseDetail.GARD_Name__c);

        // Keywords
        const arrKeywords = [];
        arrKeywords.push(diseaseDetail.GARD_Name__c);
        arrKeywords.push(diseaseDetail.Synonyms_List__c.split(', '));

        // Description
        let description = '';
        description += `${diseaseDetail.GARD_Name__c} is a `;

        if (diseaseDetail.Disease_Type__c === 'Rare') {
          description += `rare `;
        } else {
          description += `genetic `;
        }
        description += `disease that is also know by the following names: `;
        description += `${diseaseDetail.Synonyms_List__c}. `;

        description += `${diseaseDetail.GARD_Name__c} is in the categories of: `;

        // Disease_Categories__c
        // description += `${diseaseDetail.diseaseCategories.map(cat => cat.diseaseTypeName).join(', ')}. `;

        this.meta.addTags([
          {name: 'keywords', content: arrKeywords.join(', ')},
          {name: 'description', content: description},
          // {name: 'robots', content: 'index, follow'}
        ]);
      });
    });

  }

}
