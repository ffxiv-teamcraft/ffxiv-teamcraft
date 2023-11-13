import { ParsedRow } from './parsed-row';
import { ArrayField, EXDField, EXDSchema, LinkField } from './exd/EXDSchema';

export interface ColumnMapper {
  preload: string[];
  fn: (id: number, row: ParsedRow, sheets: Record<string, ParsedRow[]>) => ParsedRow | ParsedRow[] | null | number;
}

export type ReaderIndex = number | Array<ReaderIndex>;

export interface ReaderEntry {
  name: string;
  reader: ReaderIndex;
}

export class DefinitionParser {

  public get sheet(): string {
    return this.schema.name;
  }

  public get fields() {
    return this.schema.fields;
  }

  private _flatColumns: { name: string, mapper: ColumnMapper }[] = [];

  private _reader: ReaderEntry[] = [];

  public get linkMappers() {
    return this._flatColumns.filter(c => c.mapper && DefinitionParser.columnIsParsed(c.name, this.columns, true));
  }

  public get reader() {
    return this._reader.filter(c => DefinitionParser.columnIsParsed(c.name, this.columns));
  }

  public static cleanupColumnName(name: string): string {
    if (!name) {
      return null;
    }
    return name;
  }

  public static columnIsParsed(name: string, columns: string[], isForLinks = false): boolean {
    return !columns || columns.some(c => {
      const colName = this.cleanupColumnName(name).toLowerCase();
      if (c.includes('.')) {
        return c.toLowerCase().startsWith(`${colName}.`);
      }
      if (c.endsWith('_*')) {
        return colName.startsWith(c.toLowerCase().replace('_*', ''));
      }
      if (c.endsWith('*')) {
        return colName.startsWith(c.toLowerCase().replace('*', ''));
      }
      if (c.endsWith('#')) {
        return !isForLinks && colName === c.toLowerCase().replace('#', '');
      }
      return c.toLowerCase() === colName;
    });
  }

  constructor(private readonly schema: EXDSchema, private readonly columns?: string[]) {
    let index = 0;
    schema.fields.forEach((field) => {
      this.handleField(field);
      index = this.generateReader(field, index);
    });
  }

  private addReaders(readers: ReaderEntry[]): void {
    if (readers.some(r => !r.name)) {
      throw new Error(`Tried to add a reader with no name in ${this.sheet}: ${JSON.stringify(readers)}`);
    }
    this._reader.push(...readers);
  }

  private handleField(field: EXDField): void {
    this._flatColumns.push({
      name: DefinitionParser.cleanupColumnName(field.name),
      mapper: this.generateMapper(field)
    });
  }

  /**
   * Mappers are used to map raw data (like numbers, strings, etc) to more meaningful data.
   * It's mainly used for links, to place the row directly at the spot where the link value is.
   *
   * @param field
   * @private
   */
  private generateMapper(field: EXDField): ColumnMapper {
    if (!field.type) {
      return null;
    }
    switch (field.type) {
      case 'color':
      case 'scalar':
      case 'modelId':
      case 'icon':
      case 'array':
        return null; // We don't need to handle those but enumerating them here to make sure we didn't miss them
      case 'link':
        const link = field as LinkField;
        if (link.targets) {
          return {
            preload: link.targets,
            fn: (id, row, sheets) => {
              for (const t of link.targets) {
                const match = sheets[t].find(r => r.index === id);
                if (match) {
                  return match;
                }
              }
              return id;
            }
          };
        } else if (link.condition) {
          return {
            preload: Object.values(link.condition.cases).flat(),
            fn: (id, row, sheets) => {
              const rowValue = row[link.condition.switch] as any;
              const targets = link.condition.cases[rowValue];
              if (!targets) {
                return id;
              }
              for (const t of targets) {
                const match = sheets[t].find(r => r.index === id);
                if (match) {
                  return match;
                }
              }
              return id;
            }
          };
        }
    }
  }

  /**
   * Generates a reader for a given field
   *
   * Returns new index after reader has been applied.
   * @param field
   * @param index
   * @private
   */
  private generateReader(field: EXDField, index = 0): number {
    switch (field.type) {
      case 'array':
        return this.generateRepeatReader(field as ArrayField, index);
      default:
        this.addReaders([{ name: DefinitionParser.cleanupColumnName(field.name), reader: index }]);
        return index + 1;
    }
  }

  private generateRepeatReader(field: ArrayField, index: number): number {
    // TODO Fine tune this by checking what's the expected output before breaking everything
    if (field.fields?.length > 0) {
      let newIndex = index;
      new Array(field.count).fill(null)
        .map((_, colIndex) => {
          field.fields.forEach((subfield) => {
            newIndex = this.generateReader(subfield, newIndex + colIndex * field.count);
          });
        });
      return newIndex;
    }

    this.addReaders([{
      name: DefinitionParser.cleanupColumnName(field.name),
      reader: new Array(field.count).fill(null).map((_, i) => index + i)
    }]);
    return index + field.count;
  }
}
