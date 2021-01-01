import { AbstractExtractor } from './abstract-extractor';
import { Alarm } from '../../../../core/alarms/alarm';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { ListRow } from '../../model/list-row';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { AlarmsFacade } from '../../../../core/alarms/+state/alarms.facade';
import { GatheringNodesService } from '../../../../core/data/gathering-nodes.service';

export class AlarmsExtractor extends AbstractExtractor<Alarm[]> {
  constructor(gt: GarlandToolsService, private gatheringNodesService: GatheringNodesService,
              private alarmsFacade: AlarmsFacade) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.ALARMS;
  }

  isAsync(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData, row: ListRow): Alarm[] {
    const nodes = this.gatheringNodesService.getItemNodes(item.id);
    return nodes.map(node => node.limited ? this.alarmsFacade.generateAlarms(node) : []).flat();
  }

}
