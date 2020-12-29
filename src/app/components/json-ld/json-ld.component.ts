import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-json-ld',
  template: '<div [innerHTML]="jsonLD"></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonLdComponent implements OnInit {
  @Input() UrlBase: string;
  @Input() UrlSecond: string;
  @Input() UrlThird: string;
  @Input() UrlTop: string;
  jsonLD: SafeHtml;

  rootPath = 'https://gard.ci.ncats.io/';

  constructor(private domSanitizer: DomSanitizer) {
  }

  ngOnInit(): void {

    const arrListElement = [];

    if (this.UrlBase) {
      arrListElement.push({
        '@type': 'ListItem',
        position: 1,
        url: this.rootPath + this.UrlBase
      });
    }

    if (this.UrlSecond) {
      arrListElement.push({
        '@type': 'ListItem',
        position: 2,
        url: this.rootPath + this.UrlSecond
      });
    }

    if (this.UrlThird) {
      arrListElement.push({
        '@type': 'ListItem',
        position: 3,
        url: this.rootPath + this.UrlThird
      });
    }

    if (this.UrlTop) {
      arrListElement.push({
        '@type': 'ListItem',
        position: 4,
        url: this.rootPath + this.UrlTop
      });
    }

    const json = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: arrListElement
    };

    this.jsonLD = this.getSafeHTML(json);
  }

  getSafeHTML(obj: object): SafeHtml {
    // If value convert to JSON and escape / to prevent script tag in JSON
    const json = JSON.stringify(obj);
      // const json =
      // ? JSON.stringify(obj, null, 2).replace(/\//g, '\\/')
      // : '';

    // const html = `${json}`;
    const html = `<script type="application/ld+json">${json}</script>`;
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }

}
