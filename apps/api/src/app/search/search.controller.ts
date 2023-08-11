import { Controller, Get, Header, Query } from '@nestjs/common';
import { first, Observable } from 'rxjs';
import { SearchService } from './search.service';
import { SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { XIVSearchFilter } from '@ffxiv-teamcraft/search';
import { map } from 'rxjs/operators';
import { LazyDataLoader } from '../lazy-data/lazy-data.loader';

@Controller({
  path: '/search'
})
export class SearchController {

  constructor(private searchService: SearchService, private lazyData: LazyDataLoader) {
  }

  @Get()
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  getSearch(
    @Query('query') query: string,
    @Query('type') type: SearchType,
    @Query('sort_order') order: 'asc' | 'desc' = 'desc',
    @Query('sort_field') sortField?: string,
    @Query('lang') lang = 'en',
    @Query('filters') filters = '',
    @Query('full') fullData = 'false'
  ): Observable<SearchResult[]> {
    let transformedFilters: XIVSearchFilter[] = [];
    try {
      transformedFilters = (filters || '').split(',')
        .filter(Boolean)
        .map(fragment => {
          const [, field, operator, value] = fragment.match(/([^><=?!|]+)([><=?!|]{1,2})(.*)/);
          let processedValue: string | number | boolean | any[] = value;
          if (value === '' && operator !== '!!') {
            return null;
          }
          if (operator === '|=') {
            processedValue = value.split(';').map(v => {
              if (isNaN(Number(v))) {
                return v;
              }
              return +v;
            });
          } else {
            if (value === 'false') {
              processedValue = false;
            } else if (value === 'true') {
              processedValue = true;
            } else if (!isNaN(Number(value))) {
              processedValue = +value;
            }
          }
          return {
            field,
            operator: operator as any,
            value: processedValue
          };
        })
        .filter(Boolean);
    } catch (e) {
      console.error(filters, e);
    }
    return this.lazyData.get('extracts').pipe(
      map((extracts) => {
        return this.searchService.search(
          type,
          (query || '').toLowerCase(),
          transformedFilters,
          lang,
          [sortField, order]
        ).map(row => {
          if ([SearchType.ITEM, SearchType.RECIPE].includes(row.type)) {
            return {
              ...row,
              sources: extracts[row.itemId]?.sources || []
            };
          }
          return row;
        });
      }),
      first()
    );
  }
}
