import { KoboldService } from '../kobold/kobold.service';
import { SaintDefinition } from './saint/saint-definition';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ColumnSeekOptions, Row } from '@kobold/excel/dist/row';
import { BaseSaintColumnDefinition, SaintColumnDefinition, SaintGroupColumnDefinition, SaintRepeatColumnDefinition } from './saint/saint-column-definition';
import { ParsedColumn, ParsedRow } from './parsed-row';
import { SeString } from './string/se-string';
import { ColumnDataType } from '@kobold/excel';
import { ExtendedRow } from './extended-row';
import { ComplexLinkConverter, LinkConverter, MultiRefConverter } from './saint/saint-converter';
import { GetSheetOptions } from './get-sheet-options';

export class XivDataService {

  // TODO make this configurable
  private readonly saintPath = 'H:\\WebstormProjects\\SaintCoinach\\SaintCoinach\\Definitions';

  private definitionsCache: Record<string, SaintDefinition> = {};

  public UIColor: ParsedRow[];

  constructor(private readonly kobold: KoboldService) {
  }

  private getSubColumns(targetProp: string, columns?: string[]): string[] | null {
    if (!columns) {
      return null;
    }
    // If we have this prop in the array, just return it entirely
    if (columns.includes(targetProp)) {
      return null;
    }
    // If there's no inner columns for this sheet, just ignore it entirely?
    // But that should probably not be reached as we should just filter before it
    if (!columns.some(c => c.startsWith(targetProp))) {
      return [];
    }
    return columns.filter(c => c.startsWith(`${targetProp}.`)).map(c => c.replace(`${targetProp}.`, ''));
  }

  private async handleLinks(definition: SaintDefinition, content: ParsedRow[], columns: string[], depth: number) {
    /**
     * This will hold all out mappers, different return cases being for:
     *  - ParsedRow: link to a single row in a sheet and we found it
     *  - ParsedRow[]: link to multiple rows in a single sheet (with subIndexes) and we found it, or empty if we didn't
     *  - null: link to a single row but we didn't find anything
     */
    const mappers = definition.definitions
      .filter(col => this.columnIsParsed(col, columns, true))
      .map((col) => {
        const colName = this.cleanupColumnName(this.getColumnName(col));
        let mapper;
        if (col.type === 'repeat' && col.definition?.converter) {
          mapper = this.generateConverter(col.definition);
        } else {
          mapper = this.generateConverter(col);
        }
        if (!mapper) {
          return null;
        }
        return {
          col: colName,
          mapper
        };
      })
      .filter(mapper => mapper !== null);

    if (mappers.length === 0) {
      return content;
    }
    // Let's make kobold preload our linked sheets first
    const flattenPreload = mappers.map(m => {
      return m.mapper.preload.map(preload => ({
        preload,
        columns: this.getSubColumns(m.col, columns)
      }));
    }).flat();
    const sheetsArray = flattenPreload
      .reduce((acc, { preload, columns }) => {
        const existing = acc.find(r => r.sheet === preload);
        if (!existing) {
          return [
            ...acc,
            { sheet: preload, columns }
          ];
        }
        existing.columns = [...existing.columns, ...columns];
        return acc;
      }, []);
    const preloaded = await Promise.all(sheetsArray.map(async ({ sheet, columns }) => {
      const preload = await this.getSheet(sheet, { columns, depth });
      return {
        sheet,
        preload
      };
    }));
    const sheets = preloaded.reduce((acc, { sheet, preload }) => {
      return {
        ...acc,
        [sheet]: preload
      };
    }, {});

    return content.map(row => {
      return mappers.reduce((acc, entry) => {
        if (Array.isArray(row[entry.col])) {
          row[entry.col] = (row[entry.col] as number[]).map(e => entry.mapper.fn(Number(e), row, sheets));
        } else {
          row[entry.col] = entry.mapper.fn(Number(row[entry.col]), row, sheets);
        }
        return row;
      }, row);
    });
  }

  private generateConverter(col: SaintColumnDefinition): {
    preload: string[],
    fn: (id: number, row: ParsedRow, sheets: Record<string, ParsedRow[]>) => ParsedRow | ParsedRow[] | null | number
  } {
    if (!col.converter && !col.type) {
      return null;
    }
    if (col.converter) {
      switch (col.converter.type) {
        case 'color':
        case 'tomestone':
        case 'generic':
        case 'icon':
        case 'quad':
          return null; // We don't need to handle those but enumerating them here to make sure we didn't miss them
        case 'complexlink':
          return {
            preload: col.converter.links.map(link => link.sheet ? [link.sheet] : link.sheets).flat(),
            fn: (id, row, sheets) => {
              const target = (col.converter as ComplexLinkConverter).links.find(link => {
                if (row[link.when.key] === undefined) {
                  throw new Error(`Cannot process complexlink with missing property ${link.when.key}`);
                }
                return row[link.when.key] === link.when.value;
              })?.sheet;
              if (!target) {
                return id;
              }
              const sheet = sheets[target];
              if (!sheet) {
                throw new Error(`Tried to link to a sheet that's not loaded??? ${target}`);
              }
              return sheet.find(row => row.index === id);
            }
          };
        case 'multiref':
          return {
            preload: col.converter.targets,
            fn: (id, row, sheets) => {
              for (let t of (col.converter as MultiRefConverter).targets) {
                const match = sheets[t].find(r => r.index === id);
                if (match) {
                  return match;
                }
              }
              return id;
            }
          };
        case 'link':
          const target = (col.converter as LinkConverter).target;
          return {
            preload: [target],
            fn: (id, row, sheets) => {
              const sheet = sheets[target];
              if (!sheet) {
                throw new Error(`Tried to link to a sheet that's not loaded??? ${target}`);
              }
              return sheet.find(row => row.index === id);
            }
          };
      }
    }
  }

  public cleanupColumnName(name: string): string {
    return name
      .replace('{', '')
      .replace('}', '')
      .replace('<', '')
      .replace('>', '')
      .replace('[', '')
      .replace(']', '');
  }

  public getColumnName(col: BaseSaintColumnDefinition): string | null {
    if (!col) {
      return null;
    }
    if (col.name) {
      return col.name;
    }
    if (col.type === 'group') {
      return this.getColumnName(col.members[0]);
    }
    if (col.definition?.name) {
      return col.definition?.name;
    }
    if (col.definition) {
      return this.getColumnName(col.definition);
    }
    throw new Error('Cannot find column name for' + JSON.stringify(col));
  }

  public columnIsParsed(col: SaintColumnDefinition, columns: string[], isForLinks = false): boolean {
    return !columns || columns.some(c => {
      const colName = this.cleanupColumnName(this.getColumnName(col)).toLowerCase();
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

  public async getSheet(sheetName: string, options?: GetSheetOptions) {
    const depth = options?.depth ?? 1;
    const columns = options?.columns;
    const definition = this.getDefinition(sheetName);
    if (definition.definitions.length === 0) {
      return []; // Nothing to parse if there's no definitions
    }
    const sheetClass = this.generateSheetClass(definition, columns);
    const data = await this.kobold.getSheetData<typeof sheetClass, ExtendedRow>(sheetClass, options?.skipFirst);
    const parsed = data.map(row => this.getParsedRow(row));
    if (depth > 0) {
      return await this.handleLinks(definition, parsed, columns, depth - 1);
    }
    return parsed;
  }

  private getParsedRow(row: ExtendedRow): ParsedRow {
    if (row.parsed.Icon !== undefined) {
      if (row.parsed.Icon === 0) {
        row.parsed.Icon = '';
      } else {
        row.parsed.Icon = `/i/${Math.floor(Number(row.parsed.Icon) / 1000).toString().padStart(3, '0')}000/${row.parsed.Icon.toString().padStart(6, '0')}.png`;
      }
    }
    return {
      index: row.index,
      subIndex: row.subIndex,
      ...row.parsed
    };
  }

  private getDefinition(sheetName: string): SaintDefinition {
    if (!this.definitionsCache[sheetName]) {
      try {
        const raw = readFileSync(join(this.saintPath, `${sheetName}.json`), 'utf8');
        this.definitionsCache[sheetName] = JSON.parse(raw) as SaintDefinition;
      } catch (e) {
        console.error(`Missing sheet ${sheetName}.json: ${e.message}`);
        return { sheet: sheetName, definitions: [] };
      }
    }
    return this.definitionsCache[sheetName];
  }

  private generateSheetClass<T = Row>(definition: SaintDefinition, columns?: string[]) {
    const UIColor = this.UIColor || [];
    const xiv = this;
    return class DynamicRow extends ExtendedRow {
      static sheet = definition.sheet;

      public parsed: Record<string, ParsedColumn> = {};

      public getI18nColumns(): string[] {
        return this.sheetHeader.columns
          .map(({ dataType }, index) => ({ dataType, index }))
          .filter(col => col.dataType === ColumnDataType.STRING)
          .map(col => {
            return definition.definitions.find(c => {
              return (c.index || 0) === col.index;
            });
          })
          .filter(c => !!c && xiv.columnIsParsed(c, columns))
          .map(c => xiv.cleanupColumnName(xiv.getColumnName(c)));
      }

      constructor(opts) {
        super(opts);
        this.generateColumns();
      }

      private handleRepeat(index: number, col: SaintRepeatColumnDefinition): any[] {
        return new Array(col.count).fill(null).map((_, i) => {
          if (col.definition?.type === 'repeat') {
            return this.handleRepeat(index + i * col.count, col.definition as SaintRepeatColumnDefinition);
          }
          return this.unknown({ column: index + i });
        });
      }

      private generateColumns(): void {
        // Let's generate columns from definitions !
        definition.definitions
          .filter(col => xiv.columnIsParsed(col, columns))
          .forEach(col => {
            const index = col.index || 0;
            if ((col).type === 'repeat') {
              if (col.definition?.type === 'group') {
                return col.definition.members.forEach((member, mi) => {
                  this.parsed[xiv.cleanupColumnName(xiv.getColumnName(member))] = new Array(col.count).fill(null)
                    .map((_, i) => {
                      return this.unknown({ column: index + i * (col.definition as SaintGroupColumnDefinition).members.length + mi });
                    });
                }, {});
              } else {
                this.parsed[xiv.cleanupColumnName(xiv.getColumnName(col))] = this.handleRepeat(index, col as SaintRepeatColumnDefinition);
              }
            } else {
              this.parsed[xiv.cleanupColumnName(xiv.getColumnName(col))] = this.unknown({ column: index });
            }
          });
      }

      protected string(opts?: ColumnSeekOptions): string {
        const definition = this.getColumnDefinition(opts);
        // Get the specified offset of the start of the string, and search from there
        // for the following null byte, marking the end.
        const stringOffset = this.data.readUInt32BE(definition.offset);
        const dataOffset = stringOffset + this.sheetHeader.rowSize;
        const nullByteOffset = this.data.indexOf(0, dataOffset);
        const workingCopy = Buffer.alloc(nullByteOffset - dataOffset);
        this.data.copy(workingCopy, 0, dataOffset, nullByteOffset);
        return new SeString(workingCopy, UIColor).toString();
      }
    };
  }
}
