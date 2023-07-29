// eslint-disable-next-line @nx/enforce-module-boundaries
import { I18nName, LazyDataKey, LazyDataSearchIndexKey, LazyDataWithExtracts, SearchType } from '@ffxiv-teamcraft/types';
import { combineLatest, Observable, switchMap } from 'rxjs';
import { readFile } from 'fs';
import { join } from 'path';
import { lazyFilesList } from '@ffxiv-teamcraft/data/lazy-files-list';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { Document } from 'flexsearch-ts';
import * as zlib from 'zlib';

export class XIVSearch {

  // private indexes: Partial<Record<SearchType, typeof Fuse.default>> = {};
  private indexes: Partial<Record<SearchType, Document<any, true>>> = {};

  constructor(private lang: keyof I18nName, private lazyDataPath: string) {
  }

  public hasIndex(content: SearchType) {
    return this.indexes[content] !== undefined;
  }

  public buildIndex(content: SearchType): Observable<unknown> {
    return this.getSearchIndex(this.getSearchIndexKey(content)).pipe(
      switchMap((data) => {
        this.indexes[content] = new Document({
          language: this.lang,
          encode: ['ko', 'zh'].includes(this.lang) ? doc => {
            let str = doc;
            // This is due to an inconsistency in the encoder
            // When ingesting, it's called with a document object, when searching, it's called with a string.
            if (typeof doc === 'object' && doc) {
              str = doc[this.lang];
            }
            // eslint-disable-next-line no-control-regex
            return str.replace(/[\x00-\x7F]/g, '').split('');
          } : null,
          document: {
            id: 'id', index: [this.lang],
            store: true
          },
          optimize: true,
          tokenize: 'full',
          cache: true,
          context: {
            bidirectional: true,
            resolution: 9,
            depth: 1
          }
        });
        return combineLatest(data.map(row => {
            return new Observable(subscriber => {
              this.indexes[content].addAsync(row.id, row, () => {
                subscriber.next();
                subscriber.complete();
              });
            });
          })
        );
      })
    );
  }

  // TODO create a proper SearchResult typing and signature overrides here
  public search(content: SearchType, query: string): any[] {
    if (!this.hasIndex(content)) {
      throw new Error(`Trying to search on missing index ${content}, please build index first !`);
    }
    return this.indexes[content].search<true>(query, 0, { enrich: true })
      .map(res => {
        return res.result.map(row => {
          return row.doc;
        });
      })
      .flat()
      .map(doc => doc.data);
  }

  private getSearchIndexKey(content: SearchType): LazyDataSearchIndexKey {
    switch (content) {
      case SearchType.ITEM:
        return 'itemSearch';
      case SearchType.ACTION:
        return 'actionSearch';
      default:
        throw new Error(`No search index file for content ${content}`);
    }
  }

  private getSearchIndex<K extends LazyDataKey>(contentName: K): Observable<LazyDataWithExtracts[K]> {
    const lazyFile = lazyFilesList[contentName as keyof LazyData];
    if (!lazyFile) {
      throw new Error('Trying to load missing lazy file ' + contentName);
    }
    const fileName = lazyFile.fileName;
    return new Observable<LazyDataWithExtracts[K]>(observer => {
      readFile(join(this.lazyDataPath, fileName), (err, content) => {
        if (err) {
          throw err;
        }
        observer.next(JSON.parse(zlib.inflateSync(content, { level: 9 }).toString()) as LazyDataWithExtracts[K]);
        observer.complete();
      });
    });
  }

}
