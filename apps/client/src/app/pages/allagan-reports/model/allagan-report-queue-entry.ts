import { AllaganReportSource } from '@ffxiv-teamcraft/types';
import { AllaganReportStatus } from './allagan-report-status';
import { AllaganReport } from './allagan-report';

export interface AllaganReportQueueEntry {
  uid: string;
  itemId: number;
  author: string;
  type: AllaganReportStatus;
  report?: string;
  reportData?: AllaganReport;
  source: AllaganReportSource;
  data: any;
  created_at: number;
  selected?: boolean;
}
