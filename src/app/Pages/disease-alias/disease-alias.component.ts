import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {take} from 'rxjs/operators';
import {DataService} from '../../data.service';
import {Title, Meta} from '@angular/platform-browser';

@Component({
  selector: 'app-disease-alias',
  templateUrl: './disease-alias.component.html',
  styleUrls: ['./disease-alias.component.scss']
})
export class DiseaseAliasComponent {

  data = {mainPropery: null};
  diseaseAlias: string;
  diseaseSlug: string;
  diseaseAliasEncoded: string;

  constructor(
    dataSrv: DataService,
    activatedRoute: ActivatedRoute,
    private title: Title,
    private meta: Meta
  ) {
    activatedRoute.params.subscribe(param => {
      this.diseaseSlug = param.slug;
      const alias = param.alias;
      this.diseaseAlias = alias.replace(/_/g, ' ');
      this.diseaseAliasEncoded = this.Encode(this.diseaseAlias);

      dataSrv.getBySlug(this.diseaseSlug).pipe(take(1)).subscribe(diseaseDetail => {
        // console.log(`nav to:`, diseaseDetail.mainPropery.diseaseId);
        this.data = diseaseDetail;

        // Website Title
        this.title.setTitle(`${this.diseaseAlias} Alias of ${diseaseDetail.mainPropery.diseaseName}`);

        // Keywords
        const arrKeywords = [];
        arrKeywords.push(this.diseaseAlias);
        arrKeywords.push(diseaseDetail.mainPropery.diseaseName);
        arrKeywords.push(diseaseDetail.mainPropery.synonyms);

        // Description
        let description = '';
        description += `${this.diseaseAlias} is an alias of ${diseaseDetail.mainPropery.diseaseName}`;

        this.meta.addTags([
          {name: 'keywords', content: arrKeywords.join(', ')},
          {name: 'description', content: description},
          {name: 'robots', content: 'index, follow'}
        ]);
      });
    });

  }


  // tslint:disable-next-line:typedef
  Encode(str) {
    if (str === undefined) {
      return '';
    } else {
      const Encode1 = encodeURI(str.replace(/ /g, '_').replace(/:/g, '_').replace(/\//g, '_'));

      if (Encode1 === undefined) {
        console.error('!!! Encode - Undefined');
        return '';
      } else if (!Encode1) {
        console.error('!!! Encode - == false');
        return '';
      } else {
        return Encode1.replace('%E2%80%93', '');
      }
    }
  }
}

