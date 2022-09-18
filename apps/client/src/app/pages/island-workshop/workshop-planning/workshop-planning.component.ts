import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WorkshopPlanning } from '../optimizer/workshop-planning';

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

  days = [
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'Monday'
  ];
}
