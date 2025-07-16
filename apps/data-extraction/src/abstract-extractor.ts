import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { defer, interval, Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import request from 'request';
import { mkdirSync } from 'fs-extra';
import { XivDataService } from './xiv/xiv-data.service';
import { ParsedRow } from './xiv/parsed-row';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { kebabCase } from 'lodash';
import { I18nName, LazyDataChineseKey, LazyDataI18nKey, LazyDataKoreanKey } from '@ffxiv-teamcraft/types';
import zlib from 'zlib';
import { LazyPatchContent } from '@ffxiv-teamcraft/data/model/lazy-patch-content';

export abstract class AbstractExtractor {

  public static outputFolder = join(__dirname, '../../../apps/client/src/app/core/data/sources/');

  public static assetOutputFolder = join(__dirname, '../../../libs/data/src/lib/json/');

  public static tsOutputFolder = join(__dirname, '../../../libs/data/src/lib/handmade/');

  protected static XIVAPI_KEY = process.env.XIVAPI_KEY;

  protected static TOTAL_REQUESTS = 0;

  private queue: Subject<void>[] = [];

  private done$ = new Subject<string>();

  protected progress: any;

  multiBarRef: any;

  maxLevel = 100;

  constructor() {
    interval(AbstractExtractor.XIVAPI_KEY ? 50 : 250)
      .pipe(
        takeUntil(this.done$)
      )
      .subscribe(() => {
        const subject = this.queue.shift();
        if (subject) {
          subject.next();
        }
      });
  }

  public setProgress(progress: any): void {
    this.progress = progress;
  }

  public setMultiBarRef(ref: any): void {
    this.multiBarRef = ref;
  }

  public abstract getName(): string;

  protected abstract doExtract(xiv: XivDataService): void;

  public extract(xiv: XivDataService): Observable<string> {
    return of(null).pipe(
      switchMap(() => {
        this.doExtract(xiv);
        return this.done$;
      })
    );
  }

  protected getIconHD(icon: string): string {
    return icon.replace('.png', '_hr1.png');
  }

  protected getCompositeID(row: ParsedRow): string {
    return `${row.index}.${row.subIndex}`;
  }


  protected requireLazyFile(name: string): any {
    return JSON.parse(readFileSync(join(AbstractExtractor.assetOutputFolder, `${name}.json`), 'utf-8'));
  }


  protected requireLazyFileByKey<K extends keyof LazyData>(key: K): LazyData[K] {
    const kebab = kebabCase(key);
    let path = join(AbstractExtractor.assetOutputFolder, `${kebabCase(key)}.json`);
    if (kebab.startsWith('ko-')) {
      path = join(AbstractExtractor.assetOutputFolder, 'ko', `${kebabCase(key)}.json`);
    }
    if (kebab.startsWith('zh-')) {
      path = join(AbstractExtractor.assetOutputFolder, 'zh', `${kebabCase(key)}.json`);
    }
    return JSON.parse(readFileSync(path, 'utf-8'));
  }

  protected addQueryParam(url: string, paramName: string, paramValue: string | number): string {
    if (url.indexOf('?') > -1) {
      return `${url}&${paramName}=${paramValue}`;
    } else {
      return `${url}?${paramName}=${paramValue}`;
    }
  }

  protected done(): void {
    this.done$.next(this.getName());
    this.done$.complete();
  }

  protected getCoords(coords: { x: number, y: number, z: number }, mapData: { size_factor: number, offset_y: number, offset_x: number, offset_z: number }): {
    x: number,
    y: number,
    z: number
  } {
    const c = mapData.size_factor / 100;
    const x = ((+coords.x) + mapData.offset_x) * c;
    const y = ((+coords.y) + mapData.offset_y) * c;
    return {
      x: Math.floor(((41.0 / c) * ((+x + 1024.0) / 2048.0) + 1) * 100) / 100,
      y: Math.floor(((41.0 / c) * ((+y + 1024.0) / 2048.0) + 1) * 100) / 100,
      z: Math.floor((coords.z - mapData.offset_z)) / 100
    };
  }

  protected isInLayerBounds(point: { z: number }, bounds: { z: { min: number, max: number } }): boolean {
    // Only checking Z axis for now (which is Y using ingame naming) because bounding boxes are far from being accurate on X and Y axis, due to how map ranges work.
    return (point.z >= bounds.z.min && point.z <= bounds.z.max);
  }

  protected getNonXivapiUrl<T = any>(url: string): Observable<T> {
    const res$ = new Subject<T>();
    request(url, { json: true }, (err, _, res) => {
      if (err || res === '404 not found.') {
        if (err) {
          console.error(err);
        }
        res$.next(null);
        res$.complete();
      } else {
        res$.next(res);
        res$.complete();
      }
    });
    return res$.asObservable();
  }

  protected findZoneName(names: Array<I18nName & { id: string }>, zoneId: number, mapId: number): I18nName & { id: string } {
    const zoneMatch = names.find(name => +name.id === zoneId);
    if (zoneMatch) {
      return zoneMatch;
    }
    const maps = this.requireLazyFileByKey('mapEntries');
    const map = maps.find(m => m.id === mapId);
    return names.find(name => +name.id === map?.zone);
  }

  private hashString(str: string): string {
    let hash = 0, i, chr;
    if (str.length === 0) return hash.toString(16);
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  protected get<T = any>(url: string, body?: any): Observable<T> {
    const req$ = new Subject<void>();
    const queryUrl = AbstractExtractor.XIVAPI_KEY ? this.addQueryParam(url, 'private_key', AbstractExtractor.XIVAPI_KEY) : url;
    const cacheFilePath = join(__dirname, 'cache', `${this.hashString(queryUrl)}.json`);
    if (process.env.DEV_MODE) {
      if (!existsSync(join(__dirname, 'cache'))) {
        mkdirSync(join(__dirname, 'cache'));
      }
      if (existsSync(cacheFilePath)) {
        const raw = readFileSync(cacheFilePath, 'utf-8');
        AbstractExtractor.TOTAL_REQUESTS++;
        this.progress.update({
          requests: AbstractExtractor.TOTAL_REQUESTS
        });
        return of(JSON.parse(raw));
      }
    }
    this.queue.push(req$);
    return req$.pipe(
      switchMap(() => {
        AbstractExtractor.TOTAL_REQUESTS++;
        this.progress.update({
          requests: AbstractExtractor.TOTAL_REQUESTS
        });
        const res$ = new Subject<T>();
        if (body !== undefined) {
          request(queryUrl, {
            body: body,
            json: true
          }, (err, _, res) => {
            if (err || res === '404 not found.') {
              if (err) {
                console.error(err);
              }
              res$.next(null);
              res$.complete();
            } else {
              if (process.env.DEV_MODE) {
                writeFileSync(cacheFilePath, JSON.stringify(res));
              }
              res$.next(res);
              res$.complete();
            }
          });
        } else {
          request(queryUrl, { json: true }, (err, _, res) => {
            if (err || res === '404 not found.') {
              if (err) {
                console.error(err);
              }
              res$.next(null);
              res$.complete();
            } else {
              if (process.env.DEV_MODE) {
                writeFileSync(cacheFilePath, JSON.stringify(res));
              }
              res$.next(res);
              res$.complete();
            }
          });
        }
        return res$;
      })
    );
  }

  protected getSheet<T = ParsedRow>(xiv: XivDataService, contentName: string, columns?: string[], includeZero = false, depth = 0): Observable<T[]> {
    return defer(() => xiv.getSheet(contentName, { columns, depth, skipFirst: !includeZero, progress: this.progress })) as Observable<T[]>;
  }

  protected gubalRequest(gql: string): Observable<any> {
    const res$ = new Subject();
    request.post({
      url: 'https://gubal.ffxivteamcraft.com/graphql',
      json: true,
      headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_SECRET
      },
      body: {
        query: gql
      },
      timeout: 120000
    }, (err, _, res) => {
      if (!res?.data) {
        console.log(JSON.stringify(res));
      }
      AbstractExtractor.TOTAL_REQUESTS++;
      if (err) {
        console.error(err);
      } else {
        res$.next(res);
      }
    });
    return res$;
  }

  protected cleanupString(input: string): string {
    if (input === undefined) {
      return input;
    }
    return input.replace('–', '-');
  }

  protected invert2DArray(input: any[][]): any[][] {
    return input[0].map((_, colIndex) => input.map(row => row[colIndex]));
  }

  protected persistToJsonAsset(fileName: string, content: any): void {
    writeFileSync(join(AbstractExtractor.assetOutputFolder, `${fileName}.json`), JSON.stringify(content, null, 2));
  }

  protected persistToMinifiedJsonAsset(fileName: string, content: any): void {
    writeFileSync(join(AbstractExtractor.assetOutputFolder, `${fileName}.json`), JSON.stringify(content));
  }

  /**
   * @deprecated
   */
  protected persistToTypescript(fileName: string, variableName: string, content: any): void {
    const ts = `export const ${variableName} = ${JSON.stringify(content, null, 2)};`;
    writeFileSync(join(AbstractExtractor.outputFolder, `${fileName}.ts`), ts);
  }

  protected persistToTypescriptData(fileName: string, variableName: string, content: any): void {
    const ts = `export const ${variableName} = ${JSON.stringify(content, null, 2)};`;
    writeFileSync(join(AbstractExtractor.tsOutputFolder, `${fileName}.ts`), ts);
  }

  protected persistToCompressedJsonAsset(fileName: string, content: any): void {
    writeFileSync(join(AbstractExtractor.assetOutputFolder, `${fileName}.index`), zlib.deflateSync(JSON.stringify(content), { level: 9 }));
  }

  protected removeIndexes(data: ParsedRow): Omit<ParsedRow, 'index' | 'subIndex' | '__sheet'> {
    const { index, subIndex, __sheet, ...cleaned } = data;
    return cleaned;
  }

  private findPrefixedProperty(property: LazyDataI18nKey, prefix: 'ko' | 'zh'): LazyDataI18nKey {
    return `${prefix}${property[0].toUpperCase()}${property.slice(1)}` as unknown as LazyDataI18nKey;
  }

  protected getExtendedNames<T = unknown>(property: LazyDataI18nKey,
                                          getNameFn: (data: T) => I18nName = (data) => data as I18nName
  ): Array<T & { id: string } & I18nName> {
    const baseEntry = this.requireLazyFileByKey(property);
    const koEntries = this.requireLazyFileByKey(this.findPrefixedProperty(property, 'ko'));
    const zhEntries = this.requireLazyFileByKey(this.findPrefixedProperty(property, 'zh'));
    return Object.entries<T>(baseEntry as any)
      .filter(([, entry]) => getNameFn(entry).en?.length > 0)
      .map(([id, entry]) => {
        const globalName = getNameFn(entry);
        const row: T & { id: string } & I18nName = {
          id,
          ...globalName,
          ...entry
        };
        if (koEntries[id]) {
          row.ko = koEntries[id].ko;
        }
        if (zhEntries[id]) {
          row.zh = zhEntries[id].zh;
        }
        return row;
      });
  }

  protected extendNames<K extends LazyDataI18nKey>(data: ParsedRow[], sources: {
    field: string,
    targetField?: string,
    koSource?: LazyDataKoreanKey,
    zhSource?: LazyDataChineseKey
  }[]): { row: any, extended: any }[] {
    const preloadedAsianSources = {};
    sources.forEach(source => {
      preloadedAsianSources[source.field] = {
        ko: source.koSource ? this.requireLazyFileByKey(source.koSource) : null,
        zh: source.zhSource ? this.requireLazyFileByKey(source.zhSource) : null
      };
    });
    return data
      .map((row: any) => {
        const extended = {};
        sources.forEach(({ field, targetField }) => {
          if (targetField) {
            extended[targetField] = {};
          }
          const target = targetField ? extended[targetField] : extended;
          const ko = preloadedAsianSources[field]?.['ko']?.[row.index];
          const zh = preloadedAsianSources[field]?.['zh']?.[row.index];

          target.en = row[`${field}_en`];
          target.de = row[`${field}_de`];
          target.ja = row[`${field}_ja`];
          target.fr = row[`${field}_fr`];
          if (ko) {
            target.ko = ko.ko;
          }
          if (zh) {
            target.zh = zh.zh;
          }
        });
        return { row, extended };
      });
  }

  protected findPatch(content: keyof LazyPatchContent | 'quest', id: number | string): number {
    return +Object.entries(this.requireLazyFileByKey('patchContent'))
      .find(([, value]) => (value[content] || []).includes(+id))?.[0] || 1;
  }

  protected sortProperties(data: any): any {
    return Object.entries(data)
      .sort(([a], [b]) => a < b ? -1 : 1)
      .reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: value
        };
      }, {});
  }
}
