import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-list-crystals-panel',
  templateUrl: './list-crystals-panel.component.html',
  styleUrls: ['./list-crystals-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListCrystalsPanelComponent {

  @Input()
  crystals: ListRow[] = [];

  constructor(private i18nTools: I18nToolsService, private l12n: LocalizedDataService, private message: NzMessageService, private translate: TranslateService) {};

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

  public getTextExport(): string {
    let exportString = `${this.translate.instant('Crystals')}\n`;
    Object.keys(this.crystals).forEach(crystal => exportString += `${this.crystals[crystal].amount}x ${this.i18nTools.getName(this.l12n.getItem(this.crystals[crystal].id))}\n`);
    return exportString;
  }

  textCopied(): void {
    this.message.success(this.translate.instant('LIST.Copied_as_text'));
  }

}
