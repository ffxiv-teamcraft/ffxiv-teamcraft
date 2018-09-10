import { AlarmGroup } from './alarm-group';
import { AlarmDisplay } from './alarm-display';

export class AlarmGroupDisplay {

  constructor(public group: AlarmGroup, public alarms: AlarmDisplay[]) {
  }
}
