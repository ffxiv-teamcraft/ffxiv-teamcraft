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
    const next = value
      ?.toString()
      ?.replace?.(/<73>(.*?)<\/73>/gi, '')
      ?.replace?.(/\n\n/g, '\n')
      ?.replace?.('<SoftHyphen/>', '\u00AD')
      ?.replace?.(/<Clickable\((.*?)\)\/>/, '$1')
      ?.replace?.(/<Highlight>.*?<\/Highlight>/, '')
      ?.replace?.(/<Switch.*?><Case\(1\)>(.*?)<\/Case>.*?<\/Switch>/, '$1')
      ?.replace?.(/<If.*?>(.*?)<Else\/>.*?<\/If>(?!<\/If|<Else)/, '$1')
      ?.replace?.(/<\/?Emphasis>/, '*')
      ?.replace?.(/<UIForeground>([^<\/]*)<\/UIForeground>/gi, '<span>')
      ?.replace?.(/<UIGlow>([^<\/]*)<\/UIGlow>/gi, '<span>')
      ?.replace?.('<Indent/>', ' ')
      ?.replace?.(/<72>01<\/72>/gi, '</span>')
      ?.replace?.(/<UI\w+>01<\/UI\w+>/gi, '</span>')
      ?.replace?.(/\n/g, '<br>')
      ?.replace?.(/\s{2,}/, ' ')
      ?.replace?.(/<span style="color:#0001f4;">([^<\/]*)<\/span>/gim, '<b>$1</b>')
      ?.replace?.(/<span style="color:#0001f8;">([^<\/]*)<\/span>/gim, '<b>$1</b>')
      ?.replace?.('', '•');
    return this.sanitizer.bypassSecurityTrustHtml(next);
  }
}
