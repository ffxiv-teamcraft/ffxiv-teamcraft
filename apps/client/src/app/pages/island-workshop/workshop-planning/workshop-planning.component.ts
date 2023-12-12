import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WorkshopPlanning } from '../optimizer/workshop-planning';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NgFor, NgIf, DecimalPipe, DatePipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-workshop-planning',
    templateUrl: './workshop-planning.component.html',
    styleUrls: ['./workshop-planning.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgFor, ItemIconComponent, NzToolTipModule, NgIf, NzButtonModule, NzWaveModule, NzIconModule, NzEmptyModule, I18nNameComponent, NzDividerModule, DecimalPipe, DatePipe, TranslateModule]
})
export class WorkshopPlanningComponent {

  baseCellHeight = 25;

  @Input()
  planning: WorkshopPlanning[];

  @Input()
  totalScore: number;

  @Input()
  today: number;

  @Input()
  weeklyReset: number;

  @Input()
  displayItemMetadata: boolean;

  planningAvailability = [0, 0, 1, 2, 3, 3, 3];

  days = [
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'Monday'
  ];

  workshops = 4;

  constructor(public translate: TranslateService, public settings: SettingsService,
              private listPicker: ListPickerService) {
  }

  createList(planning: WorkshopPlanning[]): void {
    this.listPicker.addToList(...planning.map(row => {
      return row.planning.map(craft => {
        return {
          id: craft.itemId,
          recipeId: `mji-craftworks-${craft.id}`,
          amount: +localStorage.getItem('island-workshop:workshops') || 4
        };
      });
    }).flat());
  }
}
