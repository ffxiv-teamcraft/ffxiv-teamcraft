import { AllaganReport } from './allagan-report';
import { AllaganReportSource } from './allagan-report-source';
import { AllaganReportStatus } from './allagan-report-status';

export interface AllaganReportQueueEntry {
  uid: string;
  itemId: number;
  author: string;
  type: AllaganReportStatus;
  report?: AllaganReport;
  source: AllaganReportSource;
  data: any;
}
