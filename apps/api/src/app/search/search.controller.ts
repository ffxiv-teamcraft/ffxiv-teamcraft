import { Controller, Get, Query } from '@nestjs/common';
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
  getSearch(
    @Query('query') query: string,
    @Query('type') type: SearchType,
    @Query('sort_order') order: 'asc' | 'desc' = 'desc',
    @Query('sort_field') sortField?: string,
    @Query('lang') lang = 'en',
    @Query('region') region: Region = Region.Global,
    @Query('filters') filters = ''
  ): Observable<SearchResult[]> {
    const transformedFilters: XivapiSearchFilter[] = filters.split(',')
      .filter(Boolean)
      .map(fragment => {
        const [, column, operator, value] = fragment.match(/([^><=?!|]+)([><=?!|]+)(.*)/);
        return {
          column,
          operator: operator as XivapiSearchFilter['operator'],
          value: isNaN(Number(value)) ? value : +value
        };
      });
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
