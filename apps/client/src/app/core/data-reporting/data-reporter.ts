import { Observable } from 'rxjs';
import type { Message } from '@ffxiv-teamcraft/pcap-ffxiv';

export interface DataReporter {
  getDataReports(packets$: Observable<Message>): Observable<any[]>;

  getDataType(): string;
}
