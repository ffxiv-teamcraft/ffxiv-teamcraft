import { AbstractExtractor } from './abstract-extractor';
import { Alarm } from '../../../../core/alarms/alarm';
import { DataType } from '../data-type';
import { AlarmsFacade } from '../../../../core/alarms/+state/alarms.facade';
import { GatheringNodesService } from '../../../../core/data/gathering-nodes.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class AlarmsExtractor extends AbstractExtractor<Alarm[]> {
  constructor(private gatheringNodesService: GatheringNodesService,
              private alarmsFacade: AlarmsFacade) {
    super();
  }

  getDataType(): DataType {
    return DataType.ALARMS;
  }

  isAsync(): boolean {
    return true;
  }

  protected doExtract(itemId: number): Observable<Alarm[]> {
    return this.gatheringNodesService.getItemNodes(itemId).pipe(
      map(nodes => {
        return nodes.map(node => node.limited ? this.alarmsFacade.generateAlarms(node) : []).flat();
      })
    );
  }

}
