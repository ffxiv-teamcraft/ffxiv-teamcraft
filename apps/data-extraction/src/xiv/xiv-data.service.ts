import { KoboldService } from '../kobold/kobold.service';
import { SaintDefinition } from './saint/saint-definition';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ColumnSeekOptions, Row } from '@kobold/excel/dist/row';
import { ParsedColumn, ParsedRow } from './parsed-row';
import { SeString } from './string/se-string';
import { ColumnDataType } from '@kobold/excel';
import { ExtendedRow } from './extended-row';
import { GetSheetOptions } from './get-sheet-options';
import { ColumnMapper, DefinitionParser, ReaderIndex } from './definition-parser';
import { makeIcon } from './make-icon';

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

  private async handleLinks(parser: DefinitionParser, content: ParsedRow[], columns: string[], depth: number, progress?: any) {
    /**
     * This will hold all out mappers, different return cases being for:
     *  - ParsedRow: link to a single row in a sheet and we found it
     *  - ParsedRow[]: link to multiple rows in a single sheet (with subIndexes) and we found it, or empty if we didn't
     *  - null: link to a single row but we didn't find anything
     */
    const mappers = parser.linkMappers;

    if (mappers.length === 0) {
      return content;
    }
    // Let's make kobold preload our linked sheets first
    const flattenPreload = mappers.map(m => {
      return m.mapper.preload.map(preload => ({
        preload,
        columns: this.getSubColumns(m.name, columns)
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
        if (!columns || existing.columns === null) {
          existing.columns = null;
        } else {
          existing.columns = [...existing.columns, ...columns];
        }
        return acc;
      }, []);
    const preloaded = await Promise.all(sheetsArray.map(async ({ sheet, columns }) => {
      const preload = await this.getSheet(sheet, { columns, depth, progress });
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
        row[entry.name] = this.mapEntry(row[entry.name] as number | number[], entry.mapper, sheets, row);
        return row;
      }, row);
    });
  }

  private mapEntry(row: number | number[], mapper: ColumnMapper, sheets: Record<string, ParsedRow[]>, fullRow: ParsedRow) {
    if (Array.isArray(row)) {
      return (row as number[] | number[][]).map((e: number | number[]) => {
        return this.mapEntry(e, mapper, sheets, fullRow);
      });
    } else {
      return mapper.fn(Number(row), fullRow, sheets);
    }
  }

  public async getSheet(sheetName: string, options?: GetSheetOptions) {
    const depth = options?.depth ?? 1;
    const columns = options?.columns;
    const definition = this.getDefinition(sheetName);
    if (definition.definitions.length === 0) {
      return []; // Nothing to parse if there's no definitions
    }
    const parser = new DefinitionParser(definition, options?.columns);
    const sheetClass = this.generateSheetClass(parser, columns);
    const data = await this.kobold.getSheetData<typeof sheetClass, ExtendedRow>(sheetClass, options?.skipFirst, options?.progress);
    const parsed = data.map(row => this.getParsedRow(row));
    if (depth > 0) {
      return await this.handleLinks(parser, parsed, columns, depth - 1, options?.progress);
    }
    return parsed;
  }

  private getParsedRow(row: ExtendedRow): ParsedRow {
    if (row.parsed.Icon !== undefined) {
      row.parsed.IconID = Number(row.parsed.Icon);
      row.parsed.Icon = makeIcon(Number(row.parsed.Icon));
    }
    return {
      index: row.index,
      subIndex: row.subIndex,
      __sheet: row.__sheet,
      ...row.parsed
    };
  }

  private getDefinition(sheetName: string): SaintDefinition {
    if (!this.definitionsCache[sheetName]) {
      try {
        const raw = readFileSync(join(this.saintPath, `${sheetName}.json`), 'utf8');
        this.definitionsCache[sheetName] = JSON.parse(raw) as SaintDefinition;
      } catch (e) {
        // console.error(`Missing sheet ${sheetName}.json: ${e.message}`);
        return { sheet: sheetName, definitions: [] };
      }
    }
    return this.definitionsCache[sheetName];
  }

  private generateSheetClass<T = Row>(definition: DefinitionParser, columns?: string[]) {
    const UIColor = this.UIColor || [];
    return class DynamicRow extends ExtendedRow {
      static sheet = definition.sheet;

      public __sheet = definition.sheet;

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
          .filter(c => !!c && !!c.name && DefinitionParser.columnIsParsed(c.name, columns))
          .map(c => DefinitionParser.cleanupColumnName(c.name));
      }

      constructor(opts) {
        super(opts);
        this.generateColumns();
      }

      private generateColumns(): void {
        // Let's generate columns from definitions !
        definition
          .reader
          .forEach(({ name, reader }) => {
            this.parsed[name] = this.generateReader(reader);
          });
      }

      private generateReader(reader: ReaderIndex): any {
        if (Array.isArray(reader)) {
          return reader.map(e => this.generateReader(e));
        } else {
          return this.unknown({ column: reader });
        }
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
