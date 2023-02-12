import { Controller, Get, Header, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SearchService } from './search.service';
import { Region, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import type { XivapiSearchFilter } from '@xivapi/angular-client';

@Controller({
  path: '/search'
})
export class SearchController {

  constructor(private searchService: SearchService) {
  }

  @Get()
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  getSearch(
    @Query('query') query: string,
    @Query('type') type: SearchType,
    @Query('sort_order') order: 'asc' | 'desc' = 'desc',
    @Query('sort_field') sortField?: string,
    @Query('lang') lang = 'en',
    @Query('region') region: Region = Region.Global,
    @Query('filters') filters = ''
  ): Observable<SearchResult[]> {
    let transformedFilters: XivapiSearchFilter[] = [];
    try {
      transformedFilters = (filters || '').split(',')
        .filter(Boolean)
        .map(fragment => {
          const [, column, operator, value] = fragment.match(/([^><=?!|]+)([><=?!|]{1,2})(.*)/);
          if (value === '') {
            return null;
          }
          return {
            column,
            operator: operator as XivapiSearchFilter['operator'],
            value: isNaN(Number(value)) ? value : +value
          };
        })
        .filter(Boolean);
    } catch (e) {
      console.error(filters, e);
    }
    return this.searchService.search(
      type,
      query,
      transformedFilters,
      region,
      lang,
      lang === 'ko' || lang === 'zh' && region !== Region.China,
      [sortField, order]
    );
  }
}
