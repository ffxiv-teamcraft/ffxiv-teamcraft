export interface BaseXIVSearchFilter {
  field: string;
  operator: '=' | '>' | '<' | '<=' | '>=';
  value: number | boolean | string;
}

export interface ExcludeXIVSearchFilter {
  field: string;
  operator: '!!';
  value?: null;
}

export interface ArrayIncludesXIVSearchFilter {
  field: string;
  operator: '|=';
  value: Array<number | boolean | string>;
}

export type XIVSearchFilter = BaseXIVSearchFilter | ExcludeXIVSearchFilter | ArrayIncludesXIVSearchFilter;
