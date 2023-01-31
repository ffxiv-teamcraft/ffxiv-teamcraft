import { SearchFilter, SearchResult } from './model';
import { SearchIndex, XivapiSearchFilter, XivapiSearchOptions } from '@xivapi/angular-client';
import { from, Observable } from 'rxjs';
import axios from 'axios';

export class SearchRequest {
  constructor(private readonly query: string,
              private readonly lang: string,
              private readonly filters: SearchFilter[],
              private readonly region: string
  ) {
  }

  item(onlyCraftable: boolean, isCompatibleLocal: boolean, sort: [string, 'asc' | 'desc'] = ['', 'desc']): Observable<SearchResult[]> {
    const xivapiFilters: XivapiSearchFilter[] = this.filters
      .filter(f => {
        return f.value !== null;
      })
      .map(f => {
        if (f.minMax) {
          if (f.value.exclude) {
            return [
              <XivapiSearchFilter>{
                column: f.name,
                operator: '!!'
              }
            ];
          } else {
            return [
              <XivapiSearchFilter>{
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              <XivapiSearchFilter>{
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          }
        } else if (f.array) {
          return [
            <XivapiSearchFilter>{
              column: f.name,
              operator: '|=',
              value: f.value
            }
          ];
        }
        return [<XivapiSearchFilter>{
          column: f.name,
          operator: '=',
          value: f.value
        }];
      }).flat();

    if (onlyCraftable && !isCompatibleLocal) {
      xivapiFilters.push({
        column: 'Recipes.ClassJobID',
        operator: '>',
        value: 1
      });
    }

    const searchOptions: XivapiSearchOptions = {
      indexes: [SearchIndex.ITEM],
      string: this.query,
      filters: xivapiFilters,
      exclude_dated: 1,
      columns: ['ID', 'Name_*', 'Icon', 'Recipes', 'GameContentLinks']
    };

    if (sort[0]) {
      searchOptions.sort_field = sort[0];
    }
    searchOptions.sort_order = sort[1];

    const results$ = this.xivapiSearch(searchOptions);
  }

  private xivapiSearch<T = any>(options: XivapiSearchOptions): Observable<T> {
    return from(axios.get<T>(`${this.baseUrl}/search`, { params: options }).then(res => res.data));
  }

  private get baseUrl() {
    if (this.region === 'CN') {
      return 'https://cafemaker.wakingsands.com';
    }
    return 'https://xivapi.com';
  }
}
