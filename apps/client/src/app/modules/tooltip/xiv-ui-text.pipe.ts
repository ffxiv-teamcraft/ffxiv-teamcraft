import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { UIColor } from './ui-color';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UiColorsService } from './ui-colors.service';

@Pipe({
  name: 'xivUIText',
  pure: false
})
export class UiTextPipe implements PipeTransform, OnDestroy {

  private subscription: Subscription;

  private colors: UIColor[] = [];

  constructor(private uiColorsService: UiColorsService, private sanitizer: DomSanitizer) {
    this.subscription = this.uiColorsService.getColors().subscribe(colors => this.colors = colors);
  }

  transform(value: any = ''): SafeHtml {
    value = value.replace(/<73>(.*?)<\/73>/gi, '')
      .replace(/\n\n/g, '\n')
      .replace('<SoftHyphen/>', "\u00AD")
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
    let match;
    while (match = /<UI\w+>(.*?)<\/UI\w+>/gi.exec(value)) {
      const colorID = parseInt(match[1].substr(-4), 16);
      const colorEntry: UIColor = this.colors.find(c => c.ID === colorID);
      const color = colorEntry === undefined ? 'fff' : colorEntry.ColorAHex;
      value = value.replace(match[0], `<span style="color: #${color};">`);
    }
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
