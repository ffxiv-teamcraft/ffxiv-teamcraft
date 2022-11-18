export type ParsedColumn = string | number | boolean | bigint | ParsedColumn[];

export interface ParsedRow extends Record<string, ParsedColumn> {
  index: number;
  subIndex: number;
}
