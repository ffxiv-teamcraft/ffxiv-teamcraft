import { SaintColumnDefinition } from './saint-column-definition';

export interface SaintDefinition {
  sheet: string;
  defaultColumn?: string;
  definitions: SaintColumnDefinition[];
}
