import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataService } from '../../../core/api/data.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { HtmlToolsService } from '../../../core/tools/html-tools.service';
import { debounceTime, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { Region, SearchResult } from '@ffxiv-teamcraft/types';
import { CustomItemsFacade } from '../../custom-items/+state/custom-items.facade';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../settings/settings.service';
import { IfRegionsPipe } from '../../../pipes/pipes/if-regions';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { CustomItemNamePipe } from '../../../pipes/pipes/custom-item-name.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { LazyScrollComponent } from '../../lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-item-picker',
  templateUrl: './item-picker.component.html',
  styleUrls: ['./item-picker.component.less'],
  standalone: true,
  imports: [NzButtonModule, NzInputModule, FormsModule, NzCheckboxModule, RouterLink, NgIf, NzListModule, LazyScrollComponent, I18nNameComponent, ItemIconComponent, NzToolTipModule, FlexModule, NzWaveModule, NzIconModule, AsyncPipe, TranslateModule, XivapiIconPipe, CustomItemNamePipe, JobUnicodePipe, IfRegionsPipe, NzSpinModule]
})
export class ItemPickerComponent implements OnInit {

  public query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public results$: Observable<SearchResult[]>;

  public onlyCraftable = this.settings.onlyRecipesInPicker;

  public hideAmount = false;

  public includeCustomItems = false;

  public loading = false;

  public multi = false;

  public Region = Region;

  constructor(private dataService: DataService, private dialogRef: NzModalRef,
              private htmlTools: HtmlToolsService,
              private customItemsFacade: CustomItemsFacade, private translate: TranslateService,
              public settings: SettingsService) {
    this.results$ = this.query$.pipe(
      debounceTime(500),
      filter(query => {
        if (['ko', 'zh', 'ja'].indexOf(this.translate.currentLang.toLowerCase()) > -1) {
          // Chinese and korean characters system use fewer chars for the same thing, filters have to be handled accordingly.
          return query.length > 0;
        }
        return query.length > 3;
      }),
      tap(() => this.loading = true),
      switchMap(query => {
        return this.dataService.searchItem(query, [], this.onlyCraftable, [null, 'desc'], true).pipe(
          switchMap(results => {
            if (!this.includeCustomItems) {
              return of(results);
            }
            return this.customItemsFacade.allCustomItems$.pipe(
              map(customItems => {
                return customItems
                  .filter(item => item.name.indexOf(query) > -1)
                  .map(item => {
                    return <SearchResult>{
                      itemId: item.$key,
                      amount: 1,
                      isCustom: true
                    };
                  })
                  .concat(results);
              })
            );
          })
        );
      }),
      tap(() => this.loading = false),
      startWith([])
    );
  }

  /**
   * Generates star html string for recipes with stars.
   * @param {number} nb
   * @returns {string}
   */
  getStars(nb: number): string {
    return this.htmlTools.generateStars(nb);
  }

  close(result?: SearchResult): void {
    if (this.multi) {
      this.dialogRef.close([result]);
    } else {
      this.dialogRef.close(result);
    }
  }

  pickMulti(results: SearchResult[]): void {
    this.dialogRef.close(results.filter(r => r.selected));
  }

  nothingSelected(results: SearchResult[]): boolean {
    return results.every(r => !r.selected);
  }

  trackById(index: number, row: SearchResult): number {
    return row.id;
  }

  ngOnInit(): void {
    if (this.includeCustomItems) {
      this.customItemsFacade.loadAll();
    }
  }
}
