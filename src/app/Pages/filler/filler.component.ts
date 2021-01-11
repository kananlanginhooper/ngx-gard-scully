import {Component, OnInit} from '@angular/core';
import {DataService} from '../../data.service';
import {ActivatedRoute} from '@angular/router';
import {Meta, Title} from '@angular/platform-browser';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-filler',
  templateUrl: './filler.component.html',
  styleUrls: ['./filler.component.scss']
})
export class FillerComponent {

  data = {mainPropery: null};
  diseaseSlug = '';

  constructor(
    dataSrv: DataService,
    activatedRoute: ActivatedRoute,
    private title: Title,
    private meta: Meta
  ) {
    activatedRoute.params.subscribe(param => {
      this.diseaseSlug = param.id;
      dataSrv.getRandomData().pipe(take(1)).subscribe(diseaseDetail => {
        // console.log(`nav to:`, diseaseDetail.mainPropery.diseaseId);
        this.data = diseaseDetail;

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
        } else {
          description += `genetic `;
        }
        description += `disease that is also know by the following names: `;
        description += `${diseaseDetail.mainPropery.synonyms.join(', ')}. `;

        description += `${diseaseDetail.mainPropery.diseaseName} is in the categories of: `;
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
