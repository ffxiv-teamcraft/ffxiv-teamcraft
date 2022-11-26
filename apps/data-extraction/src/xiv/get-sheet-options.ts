export interface GetSheetOptions {
  columns?: string[];
  depth?: number;
  skipFirst?: boolean;
  // A cli-progress instance
  progress?: any;
}
