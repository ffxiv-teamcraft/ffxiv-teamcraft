import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BehaviorSubject, combineLatest, filter, Observable, shareReplay } from 'rxjs';
import { I18nName, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { XIVSearch, XIVSearchFilter } from '@ffxiv-teamcraft/search';
import { join } from 'path';

@Injectable()
export class SearchService implements OnApplicationBootstrap {

  private indexes: Record<keyof I18nName, XIVSearch>;

  private readonly _ready$ = new BehaviorSubject<boolean>(false);

  public readonly ready$ = this._ready$.pipe(
    filter(Boolean),
    shareReplay()
  );

  onApplicationBootstrap(): Promise<void> {
    return new Promise(resolve => {
      performance.mark('search:build');
      this.buildIndexes().subscribe(() => {
        performance.mark('search:built');
        console.log(`SEARCH INIT: ${performance.measure('search ingest', 'search:build', 'search:built').duration}ms`);
        this._ready$.next(true);
      });
      resolve();
    });
  }

  private getXivSearch(lang: keyof I18nName): XIVSearch {
    return new XIVSearch(lang, join(__dirname, 'assets/data'));
  }

  public buildIndexes(): Observable<unknown> {
    this.indexes = {
      en: this.getXivSearch('en'),
      ja: this.getXivSearch('ja'),
      de: this.getXivSearch('de'),
      fr: this.getXivSearch('fr'),
      ko: this.getXivSearch('ko'),
      zh: this.getXivSearch('zh'),
      tw: this.getXivSearch('tw')
    } as any;
    return combineLatest(Object.values(this.indexes).map(search => {
      return combineLatest(Object.values(SearchType).filter(v => !['Recipe', 'Any'].includes(v)).map(content => {
        return search.buildIndex(content);
      }));
    }));
  }

  public search(type: SearchType, query: string, filters: XIVSearchFilter[], lang: string, sort: [string, 'asc' | 'desc'] = ['', 'desc']): SearchResult[] {
    if (!this._ready$.value) {
      return [];
    }
    const index: XIVSearch = this.indexes[lang] || this.indexes['en'];
    if (type === SearchType.RECIPE) {
      type = SearchType.ITEM;
      filters.push({
        field: 'craftable',
        operator: '=',
        value: true
      });
    }
    if (type === SearchType.ANY) {
      return Object.values(SearchType)
        .filter(v => !['Recipe', 'Any', 'Lore'].includes(v))
        .map(content => {
          return index.search(content, query, filters, sort)
            .map(row => {
              row.type = content;
              return row;
            });
        })
        .flat();
    } else {
      return index.search(type, query, filters, sort)
        .map(row => {
          row.type = type;
          return row;
        });
    }
  }
}
