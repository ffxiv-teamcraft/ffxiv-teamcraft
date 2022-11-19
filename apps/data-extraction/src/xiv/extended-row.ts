import { Row, RowConstructor } from '@kobold/excel/dist/row';
import { ParsedColumn } from './parsed-row';

export abstract class ExtendedRow extends Row {
  parsed: Record<string, ParsedColumn>;

  public static i18nColumns: string[] = [];

  public static i18nColsParsed = false;

}

export interface ExtendedRowConstructor<T extends ExtendedRow> extends RowConstructor<T> {
  i18nColumns: string[];
  i18nColsParsed: boolean;
}
