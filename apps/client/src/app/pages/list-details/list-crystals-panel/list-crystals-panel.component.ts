import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-list-crystals-panel',
  templateUrl: './list-crystals-panel.component.html',
  styleUrls: ['./list-crystals-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListCrystalsPanelComponent {

  @Input()
  crystals: ListRow[] = [];

  constructor(private i18nTools: I18nToolsService, private message: NzMessageService, private translate: TranslateService) {
  }

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

  public getTextExport = () => {
    return safeCombineLatest(this.crystals.map((crystal) => {
      return this.i18nTools.getNameObservable('items', crystal.id).pipe(
        map(crystalName => {
          return `${crystal.amount}x ${crystalName}`;
        })
      );
    })).pipe(
      map(lines => {
        return lines.reduce((acc, line) => {
          return acc + line + '\n';
        }, `${this.translate.instant('Crystals')}\n`);
      })
    );
  };

}
