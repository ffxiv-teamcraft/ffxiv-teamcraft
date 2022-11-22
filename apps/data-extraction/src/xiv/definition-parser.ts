import { SaintDefinition } from './saint/saint-definition';
import { BaseSaintColumnDefinition, SaintColumnDefinition, SaintGroupColumnDefinition, SaintRepeatColumnDefinition } from './saint/saint-column-definition';
import { ParsedRow } from './parsed-row';
import { ComplexLinkConverter, LinkConverter, MultiRefConverter } from './saint/saint-converter';

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
    return this.definition.sheet;
  }

  public get definitions() {
    return this.definition.definitions;
  }

  private _flatColumns: { name: string, mapper: ColumnMapper }[] = [];

  private _reader: ReaderEntry[] = [];

  public get flatColumns() {
    return this._flatColumns.filter(c => DefinitionParser.columnIsParsed(c.name, this.columns));
  }

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
    return name
      .replace(/[{}\[\]<>]/gi, '');
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

  constructor(private readonly definition: SaintDefinition, private readonly columns?: string[]) {
    definition.definitions.forEach(col => {
      this.handleColumnDefinition(col as SaintColumnDefinition);
      this.generateReader(col as SaintColumnDefinition);
    });
  }

  private addReaders(readers: ReaderEntry[]): void {
    if (readers.some(r => !r.name)) {
      throw new Error(`Tried to add a reader with no name in ${this.sheet}: ${JSON.stringify(readers)}`);
    }
    this._reader.push(...readers);
  }

  private handleColumnDefinition(col: SaintColumnDefinition): void {
    switch (col.type) {
      case 'repeat':
        this.handleRepeatDefinition(col as SaintRepeatColumnDefinition);
        break;
      case 'group':
        this.handleGroupDefinition(col as SaintGroupColumnDefinition);
        break;
      default:
        this._flatColumns.push({
          name: DefinitionParser.cleanupColumnName(col.name),
          mapper: this.generateMapper(col)
        });
        break;
    }
  }

  private handleRepeatDefinition(col: SaintRepeatColumnDefinition): void {
    if (col.definition) {
      this.handleColumnDefinition(col.definition);
    } else if (col.name) {
      this._flatColumns.push({
        name: DefinitionParser.cleanupColumnName(col.name),
        mapper: this.generateMapper(col)
      });
    } else {
      throw new Error(`Trying to handle repeat with no definition and no name: ${this.sheet}::${JSON.stringify(col)}`);
    }
  }

  private handleGroupDefinition(col: SaintGroupColumnDefinition): void {
    if (col.members) {
      col.members.forEach(member => this.handleColumnDefinition(member));
    } else {
      throw new Error(`Trying to handle group with no members: ${JSON.stringify(col)}`);
    }
  }

  private generateMapper(col: SaintColumnDefinition): ColumnMapper {
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
                  throw new Error(`Cannot process complexlink with missing property ${link.when.key}, please add it to the columns you're getting.`);
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
              if (sheet.some(row => row.subIndex > 0)) {
                return sheet.filter(row => row.index === id);
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
              if (sheet.some(row => row.subIndex > 0)) {
                return sheet.filter(row => row.index === id);
              }
              return sheet.find(row => row.index === id);
            }
          };
      }
    }
  }

  private generateReader(col: SaintColumnDefinition, index = col.index || 0): void {
    switch (col.type) {
      case 'repeat':
        this.addReaders(this.generateRepeatReaderEntry(col as SaintRepeatColumnDefinition, index));
        break;
      case 'group':
        this.addReaders(this.generateGroupReaderEntry(col as SaintGroupColumnDefinition, index));
        break;
      default:
        this.addReaders([{ name: DefinitionParser.cleanupColumnName(col.name), reader: col.index || 0 }]);
    }
  }

  private generateRepeatReaderEntry(col: SaintRepeatColumnDefinition, index: number, parentCount = col.count): ReaderEntry[] {
    let name = col.definition?.name || col.name;
    if (name) {
      return [{
        name: DefinitionParser.cleanupColumnName(name),
        reader: this.generateRepeatReader(col.count, index)
      }];
    }
    // If there's no name, it's probably either nested repeat or group repeat
    const type = col.definition.type;
    switch (type) {
      case 'repeat':
        return [{
          name: DefinitionParser.cleanupColumnName(col.definition.definition?.name || col.definition.name),
          reader: new Array(col.count).fill(null).map((_, colIndex) => {
            return this.generateRepeatReader((col.definition as SaintRepeatColumnDefinition).count, index + colIndex * col.count);
          })
        }];
      case 'group':
        return this.generateGroupReaderEntry(col.definition as SaintGroupColumnDefinition, index, parentCount);
    }
  }

  private generateRepeatReader(count: number, index: number): ReaderIndex[] {
    return new Array(count).fill(null).map((_, i) => index + i);
  }

  private generateGroupReaderEntry(col: SaintGroupColumnDefinition, index: number, parentCount?: number): ReaderEntry[] {
    return col.members.map((member: BaseSaintColumnDefinition, mi) => {
      const name = member.definition?.name || member.name;
      return {
        name: DefinitionParser.cleanupColumnName(name),
        reader: new Array(parentCount).fill(null).map(
          (_, parentIndex) => {
            if (member.type === 'repeat') {
              return new Array(member.count).fill(null).map((_, memberIndex) => {
                const fullGroupSize = col.members
                  .reduce((acc, m) => acc + (m as SaintRepeatColumnDefinition).count, 0);
                const totalPreviousMembersSize = col.members
                  .slice(0, mi)
                  .reduce((acc, m) => acc + (m as SaintRepeatColumnDefinition).count, 0);
                return index + parentIndex * fullGroupSize + totalPreviousMembersSize + memberIndex;
              });
            }
            return index + parentIndex * col.members.length + mi;
          }
        )
      };
    });
  }
}
