import { Component, Inject, Input, OnInit, Optional, PLATFORM_ID } from '@angular/core';
import { SearchType } from '@ffxiv-teamcraft/trpc-api';
import { BehaviorSubject, combineLatest, merge, Subject } from 'rxjs';
import { SearchResult } from '@ffxiv-teamcraft/trpc-api';
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
export class QuickSearchComponent extends TeamcraftComponent implements OnInit {

  searchTypes = SearchType;

  public query$: Subject<string> = new Subject<string>();

  public cleanResults$: Subject<SearchResult[]> = new Subject<SearchResult[]>();

  public searchType$: BehaviorSubject<SearchType> =
    new BehaviorSubject<SearchType>(<SearchType>localStorage.getItem('search:type') || SearchType.ITEM);

  @Input()
  public reportsMode = false;

  public loading = false;

  public results$ = merge(this.cleanResults$, combineLatest([this.query$.pipe(debounceTime(800)), this.searchType$]).pipe(
    filter(([query]) => query.length > 1),
    switchMap(([query, searchType]) => {
      this.loading = true;
      return this.data.search(query.trim(), searchType, []);
    }),
    tap(() => this.loading = false)
  ));

  constructor(private route: ActivatedRoute, private settings: SettingsService,
              private translate: TranslateService, private router: Router,
              private data: DataService, @Inject(PLATFORM_ID) private platform: any,
              @Optional() private modal: NzModalRef) {
    super();
  }

  @Input()
  public set searchType(type: SearchType) {
    this.searchType$.next(type);
  }

  public navigateTo(row: SearchResult): void {
    if (!row) {
      return;
    }
    this.cleanResults$.next([]);
    if (this.reportsMode) {
      setTimeout(() => {
        this.router.navigate([
          'allagan-reports',
          row.itemId
        ]);
      }, 10);
    } else {
      let type = row.type.toLowerCase();
      if (row.type === SearchType.MONSTER) {
        type = 'mob';
      }
      if (row.type === SearchType.GATHERING_NODE) {
        type = (<any>row).node.type < 4 ? 'node' : 'spearfishing-spot';
      }
      setTimeout(() => {
        this.router.navigate([
          'db',
          this.translate.currentLang,
          type,
          row.id || row.itemId
        ]);
      }, 10);
    }
    if (this.modal) {
      this.modal.close();
    }
  }

  ngOnInit(): void {
    setTimeout(() => {
      const element: any = document.getElementById('search-input').getElementsByClassName('ant-select-selection-search-input').item(0);
      element.focus();
    }, 500);
  }

}
