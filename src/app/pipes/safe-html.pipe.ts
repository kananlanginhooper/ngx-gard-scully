import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Pipe({
  name: 'safeHTML'
})
export class SafeHTMLPipe implements PipeTransform {

  constructor(private sanitized: DomSanitizer) {
  }

  transform(value: string, ...args: unknown[]): SafeHtml {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }

}
