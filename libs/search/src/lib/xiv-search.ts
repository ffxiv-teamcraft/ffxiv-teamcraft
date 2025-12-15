// eslint-disable-next-line @nx/enforce-module-boundaries
import { I18nName, LazyDataKey, LazyDataSearchIndexKey, LazyDataWithExtracts, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { combineLatest, Observable, of, switchMap } from 'rxjs';
import { readFile } from 'fs';
import { join } from 'path';
import { lazyFilesList } from '@ffxiv-teamcraft/data/lazy-files-list';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { Document } from 'flexsearch-ts';
import { ArrayIncludesXIVSearchFilter, XIVSearchFilter } from './xiv-search-filter';
import { get } from 'lodash';
import * as zlib from 'zlib';

export class XIVSearch {

  // private indexes: Partial<Record<SearchType, typeof Fuse.default>> = {};
  private indexes: Partial<Record<SearchType, Document<any, true>>> = {};

  private rawData: Partial<Record<SearchType, (I18nName & any)[]>> = {};

  constructor(private lang: keyof I18nName, private lazyDataPath: string) {
  }

  public hasIndex(content: SearchType) {
    return this.indexes[content] !== undefined;
  }

  public buildIndex(content: SearchType): Observable<unknown> {
    if (!this.getSearchIndexKey(content) || this.rawData[content] !== undefined) {
      return of(null);
    }
    return this.getSearchIndex(this.getSearchIndexKey(content)).pipe(
      switchMap((data) => {
        this.rawData[content] = data;
        this.indexes[content] = new Document({
          language: this.lang,
          encode: ['ko', 'zh', 'tw'].includes(this.lang) ? doc => {
            let str = doc;
            // This is due to an inconsistency in the encoder
            // When ingesting, it's called with a document object, when searching, it's called with a string.
            if (typeof doc === 'object' && doc) {
              str = doc[this.lang];
            }
            // eslint-disable-next-line no-control-regex
            return str.split('');
          } : null,
          document: {
            id: 'id',
            index: [this.lang],
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

  public search(content: SearchType, query: string, filters: XIVSearchFilter[] = [], sort: [string, 'asc' | 'desc'] = ['', 'asc']): SearchResult[] {
    if (query.length === 0 && filters.length === 0) {
      return [];
    }
    if (!this.hasIndex(content)) {
      throw new Error(`Trying to search on missing index ${content}, please build index first !`);
    }
    let results = [];
    if (query.length === 0) {
      results = this.rawData[content];
    } else {
      results = this.indexes[content].search<true>(query, 1000, { enrich: true, limit: Infinity })
        .map(res => {
          return res.result.map(row => {
            return row.doc;
          });
        })
        .flat();
    }
    return results
      .filter(doc => {
        return filters.every((f: XIVSearchFilter) => {
          return this.doCompare(get(doc, f.field), f.operator, f.value);
        });
      })
      .sort((a, b) => {
        const [field, direction] = sort;
        if (field === '') {
          return 0;
        }
        if (direction === 'asc') {
          return a[field] < b[field] ? -1 : 1;
        }
        return b[field] < a[field] ? -1 : 1;
      })
      .map(row => {
        return {
          en: row.en,
          de: row.de,
          ja: row.ja,
          fr: row.fr,
          ko: row.ko,
          zh: row.zh,
          tw: row.tw,
          ...row.data
        };
      });
  }

  private doCompare(value: any, operator: XIVSearchFilter['operator'], filterValue?: XIVSearchFilter['value']): boolean {
    switch (operator) {
      case '=':
        return value === filterValue;
      case '>':
        return value > filterValue;
      case '<':
        return value < filterValue;
      case '<=':
        return value <= filterValue;
      case '>=':
        return value >= filterValue;
      case '!!':
        return value == null;
      case '|=':
        return (filterValue as ArrayIncludesXIVSearchFilter['value']).includes(+value);
    }
  }

  private getSearchIndexKey(content: SearchType): LazyDataSearchIndexKey {
    switch (content) {
      case SearchType.MONSTER:
        return 'monsterSearch';
      case SearchType.FATE:
        return 'fateSearch';
      case SearchType.MAP:
        return 'mapSearch';
      case SearchType.STATUS:
        return 'statusSearch';
      case SearchType.TRAIT:
        return 'traitSearch';
      case SearchType.ACHIEVEMENT:
        return 'achievementSearch';
      case SearchType.FISHING_SPOT:
        return 'fishingSpotSearch';
      case SearchType.GATHERING_NODE:
        return 'gatheringNodeSearch';
      case SearchType.ITEM:
        return 'itemSearch';
      case SearchType.ACTION:
        return 'actionSearch';
      case SearchType.INSTANCE:
        return 'instanceSearch';
      case SearchType.QUEST:
        return 'questSearch';
      case SearchType.NPC:
        return 'npcSearch';
      case SearchType.LEVE:
        return 'leveSearch';

      default:
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
        zlib.inflate(content, { level: 9 }, (err, data) => {
          if (err) {
            observer.error(err);
            observer.complete();
          } else {
            observer.next(JSON.parse(data.toString()));
            observer.complete();
          }
        });
      });
    });
  }

}
