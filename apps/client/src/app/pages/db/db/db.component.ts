import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { debounceTime, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformServer } from '@angular/common';
import { BehaviorSubject, combineLatest, merge, Subject } from 'rxjs';
import { SearchType } from '../../search/search-type';
import { DataService } from '../../../core/api/data.service';
import { SearchResult } from '../../../model/search/search-result';

@Component({
  selector: 'app-db',
  templateUrl: './db.component.html',
  styleUrls: ['./db.component.less']
})
export class DbComponent extends TeamcraftComponent {

  searchTypes = SearchType;

  private lang: string;

  public query$: Subject<string> = new Subject<string>();

  public cleanResults$: Subject<SearchResult[]> = new Subject<SearchResult[]>();

  public searchType$: BehaviorSubject<SearchType> =
    new BehaviorSubject<SearchType>(<SearchType>localStorage.getItem('search:type') || SearchType.ANY);

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
              private data: DataService, @Inject(PLATFORM_ID) private platform: Object) {
    super();
    this.route.paramMap.pipe(
      map(params => params.get('language')),
      takeUntil(this.onDestroy$)
    ).subscribe(lang => {
      if (this.settings.availableLocales.indexOf(lang) === -1) {
        lang = 'en';
      }
      const savedLang = localStorage.getItem('locale');
      if (!savedLang || isPlatformServer(this.platform)) {
        this.translate.use(lang);
      }
    });

    this.translate.onLangChange.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(change => {
      this.router.navigateByUrl(this.router.url.replace(`/${this.lang}/`, `/${change.lang}/`));
      this.lang = change.lang;
    });
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
  }

}
