import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyRecipesPerItem } from '@ffxiv-teamcraft/data/model/lazy-recipes-per-item';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { AsyncPipe } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';

interface ImportData {
  items: { id: number, recipes?: LazyRecipesPerItem[], quantity: number, recipeId?: string }[],
  url: string
}

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.less'],
    standalone: true,
    imports: [FlexModule, ItemIconComponent, I18nNameComponent, NzAlertModule, NzRadioModule, FormsModule, NzButtonModule, NzWaveModule, PageLoaderComponent, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe]
})
export class ImportComponent {

  public items$: Observable<ImportData>;

  wrongFormat = false;

  constructor(private route: ActivatedRoute, private listPicker: ListPickerService,
              private lazyData: LazyDataFacade, private router: Router,
              private http: HttpClient, private linkTools: LinkToolsService,
              private dialog: NzModalService, private translate: TranslateService) {

    // To test: http://localhost:4200/import/MjA1NDUsbnVsbCwzOzE3OTYyLDMyMzA4LDE7MjAyNDcsbnVsbCwx&url=https://example.org
    this.items$ = combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([params, query]) => [params.get('importString'), query.get('url')]),
      map(([importString, url]) => {
        const parsed = atob(decodeURIComponent(importString.replace(/%25/gm, '%')));
        if (parsed.indexOf(',') === -1) {
          this.wrongFormat = true;
          return { items: [], url: url };
        }
        const exploded = parsed.split(';');
        return {
          items: exploded.map(row => {
            const rowContent = row.split(',');
            const itemId = +rowContent[0];
            const recipeId = rowContent[1] === 'null' ? null : rowContent[1];
            const quantity = +rowContent[2];
            return {
              itemId: itemId,
              recipeId: recipeId,
              quantity: quantity
            };
          }),
          url: url
        };
      }),
      switchMap(parsed => {
        return combineLatest(parsed.items.map(row => {
          return this.lazyData.getRow('recipesPerItem', row.itemId, []).pipe(
            map(recipes => {
              const res = {
                id: row.itemId,
                recipeId: row.recipeId,
                quantity: row.quantity,
                recipes: recipes
              };
              if (recipes?.length > 0) {
                res.recipeId = recipes[0].id.toString();
              }
              return res;
            })
          );
        })).pipe(
          map(items => {
            return {
              items: items,
              url: parsed.url
            };
          })
        );
      })
    );
  }

  canDoImport(data: ImportData): boolean {
    return data.items.reduce((valid, row) => {
      return valid && (row.recipes.length === 0 || row.recipeId !== null);
    }, true);
  }

  doImport(data: ImportData): void {
    this.listPicker.addToList(...data.items.map(row => {
      return {
        id: row.id,
        recipeId: row.recipeId,
        amount: row.quantity
      };
    })).subscribe((list) => {
      const callbackUrl = this.getCallbackUrl();
      if (callbackUrl === null) {
        this.router.navigate(['list', list.$key]);
        return;
      }
      // The import link comes from an external site: ask before sending it the new list's link.
      this.dialog.confirm({
        nzTitle: this.translate.instant('Confirmation'),
        nzContent: this.translate.instant('LISTS.Import_callback_confirmation', { host: callbackUrl.host }),
        nzOnOk: () => {
          this.http.post(callbackUrl.href, { url: this.linkTools.getLink(`/list/${list.$key}`) }).subscribe();
        }
      }).afterClose.subscribe(() => {
        this.router.navigate(['list', list.$key]);
      });
    });
  }

  /**
   * The URL the import link wants the new list's link sent to, if it's an absolute http(s) URL.
   */
  private getCallbackUrl(): URL | null {
    const callback = this.route.snapshot.queryParamMap.get('callback');
    if (!callback) {
      return null;
    }
    try {
      const url = new URL(callback);
      return ['http:', 'https:'].includes(url.protocol) ? url : null;
    } catch {
      return null;
    }
  }

}
