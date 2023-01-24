import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'xivUIText',
  pure: true
})
export class UiTextPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(value?: string | SafeHtml): SafeHtml | null {
    if (!value) return null;
    return this.sanitizer.bypassSecurityTrustHtml(value.toString().replace(/\n\n/gm, '<br>'));
  }
}
