import { Component } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { DataService } from '../../../core/api/data.service';
import { NzModalRef } from 'ng-zorro-antd';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { HtmlToolsService } from '../../../core/tools/html-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, filter, map, startWith, tap } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';

@Component({
  selector: 'app-npc-picker',
  templateUrl: './npc-picker.component.html',
  styleUrls: ['./npc-picker.component.less']
})
export class NpcPickerComponent {

  public query$: ReplaySubject<string> = new ReplaySubject<string>();

  public results$: Observable<any[]>;

  loading = false;

  constructor(private dataService: DataService, private dialogRef: NzModalRef,
              private gt: GarlandToolsService, private htmlTools: HtmlToolsService,
              private translate: TranslateService, private lazyData: LazyDataService,
              private i18n: I18nToolsService) {
    this.results$ = this.query$.pipe(
      debounceTime(500),
      filter(query => {
        if (['ko', 'zh'].indexOf(this.translate.currentLang.toLowerCase()) > -1) {
          // Chinese and korean characters system use fewer chars for the same thing, filters have to be handled accordingly.
          return query.length > 1;
        }
        return query.length > 3;
      }),
      tap(() => this.loading = true),
      map(query => {
        return Object.keys(this.lazyData.npcs)
          .map(key => {
            const row = this.lazyData.npcs[key];
            const koRow = this.lazyData.koNpcs[key];
            row.ko = koRow === undefined ? row.en : koRow.ko;
            row.id = key;
            return row;
          })
          .filter(npc => {
            return this.i18n.getName(npc).indexOf(query) > -1;
          });
      }),
      tap(() => this.loading = false),
      startWith([])
    );
  }

  pick(npc: any): void {
    this.dialogRef.close(npc);
  }

}
