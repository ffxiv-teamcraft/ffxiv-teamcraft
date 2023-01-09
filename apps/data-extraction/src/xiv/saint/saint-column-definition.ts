import { SaintConverter } from './saint-converter';

export interface BaseSaintColumnDefinition {
  index?: number;
  isGenericReferenceTarget?: boolean;
  name?: string;
  type?: string;
  count?: number;
  converter?: SaintConverter;
  definition?: SaintColumnDefinition;
  members?: SaintColumnDefinition[];
}

export interface SaintRepeatColumnDefinition {
  index?: number;
  isGenericReferenceTarget?: boolean;
  name?: string;
  type: 'repeat';
  count: number;
  converter?: SaintConverter;
  definition: SaintColumnDefinition;
}

export interface SaintGroupColumnDefinition {
  index?: number;
  isGenericReferenceTarget?: boolean;
  name?: string;
  type: 'group';
  members: SaintColumnDefinition[];
  converter?: SaintConverter;
}

export type SaintColumnDefinition = BaseSaintColumnDefinition | SaintRepeatColumnDefinition | SaintGroupColumnDefinition;
