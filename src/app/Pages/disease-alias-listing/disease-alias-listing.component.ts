import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {take} from 'rxjs/operators';
import {DataService} from '../../data.service';
import {Title, Meta} from '@angular/platform-browser';

@Component({
  selector: 'app-disease-alias-listing',
  templateUrl: './disease-alias-listing.component.html',
  styleUrls: ['./disease-alias-listing.component.scss']
})
export class DiseaseAliasListingComponent {
  data = {mainPropery: null};
  diseaseAlias: string[];
  diseaseSlug: string;

  constructor(
    dataSrv: DataService,
    activatedRoute: ActivatedRoute,
    private title: Title,
    private meta: Meta
  ) {
    activatedRoute.params.subscribe(param => {
      this.diseaseSlug = param.slug;

      dataSrv.getBySlug(this.diseaseSlug).pipe(take(1)).subscribe(diseaseDetail => {
        // console.log(`nav to:`, diseaseDetail.mainPropery.diseaseId);
        this.data = diseaseDetail;

        // Website Title
        this.title.setTitle(`Other Names for ${diseaseDetail.mainPropery.diseaseName}`);

        // Keywords
        const arrKeywords = [];
        arrKeywords.push(diseaseDetail.mainPropery.diseaseName);
        arrKeywords.push(diseaseDetail.mainPropery.synonyms);

        // Description
        let description = '';
        description += `Other Names for ${diseaseDetail.mainPropery.diseaseName}: ${diseaseDetail.mainPropery.synonyms.join(', ')}`;

        this.meta.addTags([
          {name: 'keywords', content: arrKeywords.join(', ')},
          {name: 'description', content: description},
          {name: 'robots', content: 'index, follow'}
        ]);
      });
    });

  }

}

