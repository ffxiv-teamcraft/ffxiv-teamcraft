import { Component, Inject, Input, Optional, PLATFORM_ID } from '@angular/core';
import { SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { BehaviorSubject, combineLatest, merge, Subject } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../settings/settings.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../../core/api/data.service';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-quick-search',
    templateUrl: './quick-search.component.html',
    styleUrls: ['./quick-search.component.less'],
    standalone: true,
    imports: [NzButtonModule, NzInputModule, NzSelectModule, FormsModule, NgFor, FlexModule, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, AsyncPipe, IfMobilePipe, NodeTypeIconPipe, XivapiIconPipe, I18nPipe, TranslateModule, I18nRowPipe]
})
export class QuickSearchComponent extends TeamcraftComponent {

  searchTypes = SearchType;

  public query$: Subject<string> = new Subject<string>();

  public cleanResults$: Subject<SearchResult[]> = new Subject<SearchResult[]>();

  public searchType$: BehaviorSubject<SearchType> = new BehaviorSubject<SearchType>(SearchType.ANY);

  @Input()
  public reportsMode = false;

  public loading = false;

  public results$ = merge(this.cleanResults$, combineLatest([this.query$.pipe(debounceTime(200)), this.searchType$]).pipe(
    filter(([query]) => query.length > 1),
    switchMap(([query, searchType]) => {
      this.loading = true;
      return this.data.search(query.trim(), searchType, []);
    }),
    map(res => res.slice(0, 50)),
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

}
