export type ParsedColumn = string | number | boolean | bigint | ParsedColumn[] | ParsedRow | ParsedRow[];

export interface ParsedRow<T = any> extends Record<string, ParsedColumn> {
  __sheet: string;
  index: number;
  subIndex: number;
}
