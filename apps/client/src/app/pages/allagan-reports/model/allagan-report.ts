import { AllaganReportSource } from './allagan-report-source';

export interface AllaganReport {
  itemId: number;
  source: AllaganReportSource;
  data: any;
  uid?: string;
  created_at?: number;
  updated_at?: number;
  reporter?: string;
  reviewer?: string;
  applied?: boolean;
}
