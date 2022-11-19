export type ParsedColumn = string | number | boolean | bigint | ParsedColumn[] | ParsedRow | ParsedRow[];

export interface ParsedRow extends Record<string, ParsedColumn> {
  index: number;
  subIndex: number;
}
