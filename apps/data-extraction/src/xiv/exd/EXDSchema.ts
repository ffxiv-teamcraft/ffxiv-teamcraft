export interface BaseField {
  name: string;
  comment?: string;
  type: string;
}

export interface IconField extends BaseField {
  type: 'icon';
}

export interface ScalarField extends BaseField {
  type: 'scalar';
}

export interface ModelIdField extends BaseField {
  type: 'modelId';
}

export interface LinkConditions {
  switch: 'string';
  cases: Record<number | string, string | string[]>;
}

export interface LinkField extends BaseField {
  type: 'link';
  targets?: string[];
  condition?: LinkConditions;
}

export interface ArrayField extends BaseField {
  type: 'array';
  count: number;
  fields: EXDField[]
}

export type EXDField = BaseField | IconField | ScalarField | ModelIdField | LinkField | ArrayField;

export interface EXDSchema {
  name: string;
  displayField?: string;
  fields: EXDField[]
}
