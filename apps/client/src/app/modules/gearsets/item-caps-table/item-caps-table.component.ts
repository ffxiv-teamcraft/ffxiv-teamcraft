import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StatsService } from '../stats.service';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';

@Component({
  selector: 'app-item-caps-table',
  templateUrl: './item-caps-table.component.html',
  styleUrls: ['./item-caps-table.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCapsTableComponent {

  @Input()
  job: number;

  @Input()
  equipmentPiece: EquipmentPiece;

  constructor(private statsService: StatsService) {
  }

  getMaxValuesTable(): number[][] {
    return this.statsService.getMaxValuesTable(this.job, this.equipmentPiece);
  }

}
