import { ParsedRow } from './parsed-row';
import { ArrayField, EXDField, EXDSchema, LinkField } from './exd/EXDSchema';

export interface ColumnMapper {
  preload: string[];
  fn: (id: number, row: ParsedRow, sheets: Record<string, ParsedRow[]>) => ParsedRow | ParsedRow[] | null | number;
}

export type ReaderIndex = number | number[];

export interface ReaderEntry {
  name: string;
  flatName: string;
  /**
   * ReaderIndex is for flat values or flat arrays
   * ReaderEntry[][] is for when we have arrays of objects
   */
  reader: ReaderIndex | ReaderEntry[][];
}

export interface MapperEntry {
  name: string,
  flatName: string;
  mapper?: ColumnMapper,
  mappers?: MapperEntry[]
}

export class DefinitionParser {

  private index = 0;

  public get sheet(): string {
    return this.schema.name;
  }

  public get fields() {
    return this.schema.fields;
  }

  private _flatColumns: MapperEntry[] = [];

  private _reader: ReaderEntry[] = [];

  public get linkMappers() {
    return this._flatColumns
      .filter(c => {
        return c.mappers || (c.mapper && DefinitionParser.columnIsParsed(c.flatName, this.columns, true));
      })
      .map(c => {
        const copy = { ...c };
        if (c.mappers) {
          copy.mappers = copy.mappers.filter(m => {
            return m.mapper && DefinitionParser.columnIsParsed(m.flatName, this.columns, true);
          });
          return copy;
        }
        return c;
      })
      .filter(Boolean);
  }

  public get reader() {
    return this._reader.map(c => {
      const copy = { ...c };
      if (Array.isArray(c.reader) && Array.isArray(c.reader[0])) {
        const readerArray = c.reader as ReaderEntry[][];
        copy.reader = readerArray.map(subarray => {
          return subarray.filter(prop => {
            return DefinitionParser.columnIsParsed(prop.flatName, this.columns);
          });
        });
        return copy;
      }
      return DefinitionParser.columnIsParsed(c.name, this.columns) ? c : null;
    }).filter(Boolean);
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
    this._flatColumns = this.generateMappers(schema.fields);
    this._reader = this.generateReaders(schema.fields);
  }

  private generateMappers(fields: EXDField[], prefix = ''): MapperEntry[] {
    return fields.map(field => {
      const name = DefinitionParser.cleanupColumnName(field.name);
      const flatName = prefix ? `${prefix}:${name}` : name;
      if (field.type === 'array') {
        const arrayField = field as ArrayField;
        // If first field has no name, it's just a basic mapper, else go into recursion with prefix
        if (arrayField.fields) {
          if (arrayField.fields[0]?.name) {
            return {
              name,
              flatName,
              mappers: this.generateMappers(arrayField.fields, name)
            };
          } else {
            return {
              name,
              flatName,
              mapper: this.generateMapper(arrayField.fields[0])
            };
          }
        }
      }
      return {
        name,
        flatName,
        mapper: this.generateMapper(field)
      };
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
                const data = this.getLinkedData(sheets[t], id);
                if (data) {
                  return data;
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
                const data = this.getLinkedData(sheets[t], id);
                if (data) {
                  return data;
                }
              }
              return id;
            }
          };
        }
    }
  }

  private getLinkedData(sheet: ParsedRow[], id: number): ParsedRow | ParsedRow[] | null {
    if (sheet.some(row => row.subIndex > 0)) {
      const match = sheet.filter(row => row.index === id);
      if (match.length > 0) {
        return match;
      }
    } else {
      const match = sheet.find(row => row.index === id);
      if (!match) {
        return null;
      }
      return match;
    }
    return null;
  }

  private generateReaders(fields: EXDField[], prefix = ''): ReaderEntry[] {
    return fields.map(field => {
      const name = DefinitionParser.cleanupColumnName(field.name);
      const flatName = prefix ? `${prefix}:${name}` : name;
      if (field.type === 'array') {
        return this.generateArrayReader(field as ArrayField, prefix);
      }
      return { name, flatName, reader: this.index++ };
    });
  }

  private generateArrayReader(field: ArrayField, prefix = ''): ReaderEntry {
    const name = DefinitionParser.cleanupColumnName(field.name);
    const flatName = prefix ? `${prefix}:${name}` : name;
    if (field.fields?.length > 0 && field.fields[0]?.name) {
      return {
        name,
        flatName,
        reader: new Array(field.count)
          .fill(null)
          .map(() => {
            return this.generateReaders(field.fields, name);
          })
      };
    }

    return {
      name,
      flatName,
      reader: new Array(field.count).fill(null).map((_) => this.index++)
    };
  }
}
