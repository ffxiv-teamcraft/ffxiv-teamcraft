import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataService } from '../../../core/api/data.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { HtmlToolsService } from '../../../core/tools/html-tools.service';
import { debounceTime, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { SearchResult } from '@ffxiv-teamcraft/types';
import { CustomItemsFacade } from '../../custom-items/+state/custom-items.facade';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../settings/settings.service';
import { Region } from '@ffxiv-teamcraft/types';

@Component({
  selector: 'app-item-picker',
  templateUrl: './item-picker.component.html',
  styleUrls: ['./item-picker.component.less']
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
              private gt: GarlandToolsService, private htmlTools: HtmlToolsService,
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
   * Gets job information from a given job id.
   * @param {number} id
   * @returns {any}
   */
  getJob(id: number): any {
    return this.gt.getJob(id);
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

  ngOnInit(): void {
    if (this.includeCustomItems) {
      this.customItemsFacade.loadAll();
    }
  }
}
