import { ChangeDetectionStrategy, Component, Input, numberAttribute } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-db-button',
  templateUrl: './db-button.component.html',
  styleUrls: ['./db-button.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DbButtonComponent {

  @Input({ required: true })
  type: string;

  @Input({ required: true, transform: numberAttribute })
  id: number;

  constructor(private translate: TranslateService) {
  }

  getLink(): string {
    return `/db/${this.translate.currentLang}/${this.type}/${this.id}`;
  }

}
