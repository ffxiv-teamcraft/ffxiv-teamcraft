import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WorkshopPlanning } from '../optimizer/workshop-planning';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../modules/settings/settings.service';

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

  days = [
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'Monday'
  ];

  constructor(public translate: TranslateService, public settings: SettingsService) {
  }
}
