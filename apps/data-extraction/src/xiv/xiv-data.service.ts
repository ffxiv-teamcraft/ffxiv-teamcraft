import { KoboldService } from '../kobold/kobold.service';
import { SaintDefinition } from './saint/saint-definition';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ColumnSeekOptions, Row } from '@kobold/excel/dist/row';
import { BaseSaintColumnDefinition, SaintRepeatColumnDefinition } from './saint/saint-column-definition';
import { ParsedColumn, ParsedRow } from './parsed-row';
import { SeString } from './string/se-string';

class RowWithParsed extends Row {
  parsed: Record<string, ParsedColumn>;
}

export class XivDataService {

  // TODO make this configurable
  private readonly saintPath = 'H:\\WebstormProjects\\SaintCoinach\\SaintCoinach\\Definitions';

  private definitionsCache: Record<string, SaintDefinition> = {};

  public UIColor: ParsedRow[];

  constructor(private readonly kobold: KoboldService) {
  }

  public async getSheet(sheetName: string, columns?: string[]) {
    const definition = this.getDefinition(sheetName);
    const sheetClass = this.generateSheetClass(definition, columns);
    const data = await this.kobold.getSheetData<typeof sheetClass, RowWithParsed>(sheetClass);
    const parsed = data.map(row => this.getParsedRow(row));
    if (definition.definitions.length === 0) {
      return []; // Nothing to parse if there's no definitions
    }
    return parsed;
  }

  private getParsedRow(row: RowWithParsed): ParsedRow {
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
    return class DynamicRow extends Row {
      static sheet = definition.sheet;

      public parsed: Record<string, ParsedColumn> = {};

      constructor(opts) {
        super(opts);
        this.generateColumns();
      }

      private cleanupColumnName(name: string): string {
        return name
          .replace('{', '')
          .replace('}', '')
          .replace('[', '')
          .replace(']', '');
      }

      private handleRepeat(index: number, col: SaintRepeatColumnDefinition, offset = 0): any[] {
        return new Array(col.count).fill(null).map((_, i) => {
          if (col.definition.type === 'repeat') {
            return this.handleRepeat(index + i * col.count, col.definition as SaintRepeatColumnDefinition, offset);
          }
          return this.unknown({ column: index + i + offset });
        });
      }

      private getColumnName(col: BaseSaintColumnDefinition): string {
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

      generateColumns(): void {
        // Let's generate columns from definitions !
        definition.definitions
          .filter(col => {
            return !columns || columns.some(c => {
              if (c.endsWith('_*')) {
                return this.cleanupColumnName(this.getColumnName(col)).toLowerCase().startsWith(c.toLowerCase().replace('_*', ''));
              }
              if (c.endsWith('*')) {
                return this.cleanupColumnName(this.getColumnName(col)).toLowerCase().startsWith(c.toLowerCase().replace('*', ''));
              }
              return c.toLowerCase() === this.cleanupColumnName(this.getColumnName(col)).toLowerCase();
            });
          })
          .forEach(col => {
            const index = col.index || 0;
            if (col.type === 'repeat') {
              if (col.definition.type === 'group') {
                return col.definition.members.forEach((member, mi) => {
                  this.parsed[this.cleanupColumnName(this.getColumnName(member))] = new Array(col.count).fill(null).map((_, i) => {
                    return this.unknown({ column: index + i + mi });
                  });
                }, {});
              } else {
                this.parsed[this.cleanupColumnName(this.getColumnName(col))] = this.handleRepeat(index, col as SaintRepeatColumnDefinition);
              }
            } else {
              this.parsed[this.cleanupColumnName(this.getColumnName(col))] = this.unknown({ column: index });
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
