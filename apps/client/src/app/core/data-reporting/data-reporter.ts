import { Observable } from 'rxjs';
import type { Message } from '@ffxiv-teamcraft/pcap-ffxiv/models';

export interface DataReporter {
  getDataReports(packets$: Observable<Message>): Observable<any[]>;

  getDataType(): string;
}
