import { Kobold } from '@kobold/core';
import { buildKoboldXIV } from '@kobold/xiv';
import { ExcelList, Language } from '@kobold/excel/dist/files';
import { Excel } from '@kobold/excel';
import { ExtendedRow, ExtendedRowConstructor } from '../xiv/extended-row';

export class KoboldService {
  private kobold: Kobold;

  async init() {
    this.kobold = await buildKoboldXIV();
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

  public async getSheetData<T extends ExtendedRowConstructor<R>, R extends ExtendedRow>(sheetClass: T, skipFirst = false): Promise<R[]> {
    // Using a new excel everytime even if it derps cache, because else we'll have troubles with same sheet asked twice with diff columns
    const excel = new Excel({ kobold: this.kobold, language: Language.ENGLISH });
    const i18nSheets = {
      en: await excel.getSheet(sheetClass, { language: Language.ENGLISH }),
      de: await excel.getSheet(sheetClass, { language: Language.GERMAN }),
      ja: await excel.getSheet(sheetClass, { language: Language.JAPANESE }),
      fr: await excel.getSheet(sheetClass, { language: Language.FRENCH })
    };
    const content = [];
    let counter = 0;
    let i18nColumns = null;
    for await(const row of i18nSheets.en.getRows()) {
      if (!i18nColumns) {
        i18nColumns = row.getI18nColumns();
      }
      if (skipFirst && counter === 0 && row.index === 0) {
        counter++;
        continue;
      }
      for (const key of i18nColumns) {
        row.parsed[`${key}_en`] = row.parsed[key];
        row.parsed[`${key}_de`] = await i18nSheets.de.getRow(row.index, row.subIndex).then(r => r.parsed[key]);
        row.parsed[`${key}_ja`] = await i18nSheets.ja.getRow(row.index, row.subIndex).then(r => r.parsed[key]);
        row.parsed[`${key}_fr`] = await i18nSheets.fr.getRow(row.index, row.subIndex).then(r => r.parsed[key]);
      }
      content.push(row);
      counter++;
    }
    return content;
  }
}
