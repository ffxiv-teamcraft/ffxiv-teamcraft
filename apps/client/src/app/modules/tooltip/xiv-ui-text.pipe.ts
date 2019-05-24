import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UiColorsService } from './ui-colors.service';

@Pipe({
  name: 'xivUIText',
  pure: true
})
export class UiTextPipe implements PipeTransform {

  constructor(private uiColorsService: UiColorsService, private sanitizer: DomSanitizer) {
  }

  transform(value: any = ''): SafeHtml {
    value = value.replace(/<73>(.*?)<\/73>/gi, '')
      .replace(/\n\n/g, '\n')
      .replace('<SoftHyphen/>', '\u00AD')
      .replace(/<Clickable\((.*?)\)\/>/, '$1')
      .replace(/<Highlight>.*?<\/Highlight>/, '')
      .replace(/<Switch.*?><Case\(1\)>(.*?)<\/Case>.*?<\/Switch>/, '$1')
      .replace(/<If.*?>(.*?)<Else\/>.*?<\/If>(?!<\/If|<Else)/, '$1')
      .replace(/<\/?Emphasis>/, '*')
      .replace('<Indent/>', ' ')
      .replace(/<72>01<\/72>/gi, '</span>')
      .replace(/<UI\w+>01<\/UI\w+>/gi, '</span>')
      .replace(/\n/g, '<br>')
      .replace(/\s{2,}/, ' ');
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

}
