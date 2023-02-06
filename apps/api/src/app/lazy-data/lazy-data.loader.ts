import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { Observable, shareReplay } from 'rxjs';
import { lazyFilesList } from '@ffxiv-teamcraft/data/lazy-files-list';
import { readFile } from 'fs';
import { join } from 'path';

export type LazyDataWithExtracts = { [Property in keyof LazyData]: LazyData[Property] } & { extracts: Record<number, any> };

export class LazyDataLoader {

  public cache: Record<string, Observable<any>> = {};

  public get<K extends keyof LazyData | 'extracts'>(contentName: K): Observable<LazyDataWithExtracts[K]> {
    let fileName: string;
    let folder: string;
    if (contentName === 'extracts') {
      folder = 'assets/extracts';
      fileName = `extracts.json`;
    } else {
      const lazyFile = lazyFilesList[contentName as keyof LazyData];
      fileName = lazyFile.fileName;
      folder = 'assets/data';
    }
    if (!this.cache[contentName]) {
      this.cache[contentName] = new Observable(observer => {
        readFile(join(__dirname, folder, fileName), 'utf-8', (err, content) => {
          if (err) {
            observer.error(err);
          } else {
            observer.next(JSON.parse(content));
          }
          observer.complete();
        });
      }).pipe(
        shareReplay(1)
      );
    }
    return this.cache[contentName];
  }
}
