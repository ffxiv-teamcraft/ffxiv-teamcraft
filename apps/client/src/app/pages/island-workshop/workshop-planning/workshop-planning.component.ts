import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WorkshopPlanning } from '../optimizer/workshop-planning';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';

@Component({
  selector: 'app-workshop-planning',
  templateUrl: './workshop-planning.component.html',
  styleUrls: ['./workshop-planning.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  days = [
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'Monday'
  ];

  workshops = 3;

  constructor(public translate: TranslateService, public settings: SettingsService,
              private listPicker: ListPickerService) {
  }

  createList(planning: WorkshopPlanning[]): void {
    this.listPicker.addToList(...planning.map(row => {
      return row.planning.map(craft => {
        return {
          id: craft.itemId,
          recipeId: `mji-craftworks-${craft.id}`,
          amount: this.workshops
        };
      });
    }).flat());
  }
}
