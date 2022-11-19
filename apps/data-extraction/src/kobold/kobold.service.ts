import { Kobold } from '@kobold/core';
import { buildKoboldXIV } from '@kobold/xiv';
import { ExcelList, Language } from '@kobold/excel/dist/files';
import { Excel, Row } from '@kobold/excel';
import { ExtendedRow, ExtendedRowConstructor } from '../xiv/extended-row';

export class KoboldService {
  private kobold: Kobold;

  private excel: Excel;

  private rawSheetsCache: Record<string, Row[]> = {};

  async init() {
    this.kobold = await buildKoboldXIV();
    this.excel = new Excel({ kobold: this.kobold, language: Language.ENGLISH });
  }

  public async getSheetsList(): Promise<string[]> {
    try {
      const list = await this.kobold.getFile('exd/root.exl', ExcelList);
      return Array.from(list.sheets.keys()).filter(sheet => !sheet.includes('/'));
    } catch (e) {
      console.error(e);
      throw new Error('exd/root.exl file not found');
    }
  }

  public async getSheetData<T extends ExtendedRowConstructor<R>, R extends ExtendedRow>(sheetClass: T): Promise<R[]> {
    const sheetName = sheetClass.sheet;
    if (!this.rawSheetsCache[sheetName]) {
      try {
        const i18nSheets = {
          en: await this.excel.getSheet(sheetClass, { language: Language.ENGLISH }),
          de: await this.excel.getSheet(sheetClass, { language: Language.GERMAN }),
          ja: await this.excel.getSheet(sheetClass, { language: Language.JAPANESE }),
          fr: await this.excel.getSheet(sheetClass, { language: Language.FRENCH })
        };
        const content = [];
        let counter = 0;
        for await(const row of i18nSheets.en.getRows()) {
          for (const key of sheetClass.i18nColumns) {
            row.parsed[`${key}_en`] = row.parsed[key];
            row.parsed[`${key}_de`] = await i18nSheets.de.getRow(row.index, row.subIndex).then(r => r.parsed[key]);
            row.parsed[`${key}_ja`] = await i18nSheets.ja.getRow(row.index, row.subIndex).then(r => r.parsed[key]);
            row.parsed[`${key}_fr`] = await i18nSheets.fr.getRow(row.index, row.subIndex).then(r => r.parsed[key]);
          }
          content.push(row);
          counter++;
        }
        this.rawSheetsCache[sheetName] = content;
        return this.rawSheetsCache[sheetName] as R[];
      } catch (e) {
        console.error(e);
        throw new Error(e.message);
      }
    }
    return this.rawSheetsCache[sheetName] as R[];
  }
}
