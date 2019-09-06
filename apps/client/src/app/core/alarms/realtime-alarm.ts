import { UtcDay } from './utc-day';

export class RealtimeAlarm {

  constructor(
    public readonly hours: number[],
    public readonly label: string,
    public readonly day?: UtcDay
  ) {
  }
}
