import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IpcService } from '../electron/ipc.service';

@Component({
  selector: 'app-db-button',
  templateUrl: './db-button.component.html',
  styleUrls: ['./db-button.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DbButtonComponent {

  @Input()
  type: string;

  @Input()
  id: number;

  constructor(private translate: TranslateService, private ipc: IpcService) {
  }

  getLink(): string {
    return `/db/${this.translate.currentLang}/${this.type}/${this.id}`;
  }

  openInBrowser(url: string): void {
    this.ipc.send('open-link', url);
  }

}
