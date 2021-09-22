export interface AllaganReport {
  itemId: number;
  source: string; //TODO enum
  data: any; //TODO infer from source
  uid: string;
  created_at: number;
  updated_at: number;
  reporter: string;
  reviewer: string;
  deleted?: boolean;
}
