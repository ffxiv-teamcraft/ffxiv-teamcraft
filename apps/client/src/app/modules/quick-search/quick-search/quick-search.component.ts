import { Component, Inject, Optional, PLATFORM_ID } from '@angular/core';
import { SearchType } from '../../../pages/search/search-type';
import { BehaviorSubject, combineLatest, merge, Subject } from 'rxjs';
import { SearchResult } from '../../../model/search/search-result';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../settings/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../../../core/api/data.service';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.less']
})
export class QuickSearchComponent extends TeamcraftComponent {

  searchTypes = SearchType;

  public query$: Subject<string> = new Subject<string>();

  public cleanResults$: Subject<SearchResult[]> = new Subject<SearchResult[]>();

  public searchType$: BehaviorSubject<SearchType> =
    new BehaviorSubject<SearchType>(<SearchType>localStorage.getItem('search:type') || SearchType.ITEM);

  public results$ = merge(this.cleanResults$, combineLatest([this.query$.pipe(debounceTime(800)), this.searchType$]).pipe(
    filter(([query]) => query.length > 1),
    switchMap(([query, searchType]) => {
      this.loading = true;
      return this.data.search(query, searchType, []);
    }),
    tap(() => this.loading = false)
  ));

  public loading = false;

  constructor(private route: ActivatedRoute, private settings: SettingsService,
              private translate: TranslateService, private router: Router,
              private data: DataService, @Inject(PLATFORM_ID) private platform: Object,
              @Optional() private modal: NzModalRef) {
    super();
  }

  public navigateTo(row: SearchResult): void {
    if (!row) {
      return;
    }
    this.cleanResults$.next([]);
    let type = row.type.toLowerCase();
    if (row.type === SearchType.MONSTER) {
      type = 'mob';
    }
    setTimeout(() => {
      this.router.navigate([
        'db',
        this.translate.currentLang,
        type,
        row.id || row.itemId
      ]);
    }, 10);
    if (this.modal) {
      this.modal.close();
    }
  }

}
