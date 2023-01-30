import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { defer, interval, Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import request from 'request';
import { mkdirSync } from 'fs-extra';
import { XivDataService } from './xiv/xiv-data.service';
import { ParsedRow } from './xiv/parsed-row';

export abstract class AbstractExtractor {

  protected static outputFolder = join(__dirname, '../../../client/src/app/core/data/sources/');

  protected static assetOutputFolder = join(__dirname, '../../../../libs/data/src/lib/json/');

  protected static XIVAPI_KEY = process.env.XIVAPI_KEY;

  protected static TOTAL_REQUESTS = 0;

  private queue: Subject<void>[] = [];

  private done$ = new Subject<string>();

  protected progress: any;

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
    return require(join(AbstractExtractor.assetOutputFolder, `${name}.json`));
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

  protected getCoords(coords: { x: number, y: number, z: number }, mapData: { size_factor: number, offset_y: number, offset_x: number, offset_z: number }): { x: number, y: number, z: number } {
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
      url: 'https://gubal.hasura.app/v1/graphql',
      json: true,
      headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_SECRET
      },
      body: {
        query: gql
      }
    }, (err, _, res) => {
      if (!res.data) {
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
  };

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

  protected persistToTypescript(fileName: string, variableName: string, content: any): void {
    const ts = `export const ${variableName} = ${JSON.stringify(content, null, 2)};`;
    writeFileSync(join(AbstractExtractor.outputFolder, `${fileName}.ts`), ts);
  }

  protected removeIndexes(data: ParsedRow): Omit<ParsedRow, 'index' | 'subIndex' | '__sheet'> {
    const { index, subIndex, __sheet, ...cleaned } = data;
    return cleaned;
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
