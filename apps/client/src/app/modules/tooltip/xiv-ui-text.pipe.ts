import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'xivUIText',
    pure: true,
    standalone: true
})
export class UiTextPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);


  transform(value?: string | SafeHtml): SafeHtml | null {
    if (!value) return null;
    return this.sanitizer.bypassSecurityTrustHtml(value.toString().replace(/\n\n/gm, '<br>'));
  }
}
