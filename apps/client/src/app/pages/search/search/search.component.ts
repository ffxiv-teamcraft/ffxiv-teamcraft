import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, Observable, Subject } from 'rxjs';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { DataService } from '../../../core/api/data.service';
import { debounceTime, filter, map, mergeMap, tap } from 'rxjs/operators';
import { SearchResult } from '../../../model/search/search-result';
import { SettingsService } from '../../settings/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less']
})
export class SearchComponent implements OnInit {

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  onlyRecipes$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  results$: Observable<SearchResult[]>;

  showIntro = true;

  loading = false;

  constructor(private gt: GarlandToolsService, private data: DataService, public settings: SettingsService,
              private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.results$ = combineLatest(this.query$, this.onlyRecipes$).pipe(
      filter(([query]) => query.length > 3),
      debounceTime(500),
      tap(([query, onlyRecipes]) => {
        this.showIntro = false;
        this.loading = true;
        const queryParams = {
          query: query,
          onlyRecipes: onlyRecipes
        };
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: queryParams,
          relativeTo: this.route
        });
      }),
      mergeMap(([query, onlyRecipes]) => this.data.searchItem(query, [], onlyRecipes)),
      tap(() => {
        this.loading = false;
      })
    );

    this.route.queryParams.pipe(
      filter(params => {
        return params.query !== undefined && params.onlyRecipes !== undefined;
      })
    ).subscribe(params => {
      this.onlyRecipes$.next(params.onlyRecipes);
      this.query$.next(params.query);
    });
  }

}
