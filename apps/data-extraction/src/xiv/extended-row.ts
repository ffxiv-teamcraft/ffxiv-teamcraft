import { Row, RowConstructor } from '@kobold/excel/dist/row';
import { ParsedColumn } from './parsed-row';

export abstract class ExtendedRow extends Row {
  parsed: Record<string, ParsedColumn>;

  public static i18nColumns: string[] = [];

  public static i18nColsParsed = false;

  public abstract getI18nColumns(): string[];
}

export interface ExtendedRowConstructor<T extends ExtendedRow> extends RowConstructor<T> {
}
