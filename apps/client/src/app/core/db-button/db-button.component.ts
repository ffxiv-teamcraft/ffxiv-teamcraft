import { ChangeDetectionStrategy, Component, Input, numberAttribute, inject } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterLink } from '@angular/router';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-db-button',
    templateUrl: './db-button.component.html',
    styleUrls: ['./db-button.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzButtonModule, NzTooltipModule, RouterLink, NzIconModule, TranslateModule]
})
export class DbButtonComponent {
  private translate = inject(TranslateService);


  @Input({ required: true })
  type: string;

  @Input({ required: true, transform: numberAttribute })
  id: number;

  getLink(): string {
    return `/db/${this.translate.currentLang}/${this.type}/${this.id}`;
  }

}
