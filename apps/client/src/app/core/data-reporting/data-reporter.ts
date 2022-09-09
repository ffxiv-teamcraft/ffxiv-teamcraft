import { Observable } from 'rxjs';
import { Message } from '@ffxiv-teamcraft/pcap-ffxiv';

export interface DataReporter {
  getDataReports(packets$: Observable<Message>): Observable<any[]>;

  getDataType(): string;
}
