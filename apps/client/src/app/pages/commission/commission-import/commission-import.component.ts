import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { HttpClient } from '@angular/common/http';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { CommissionImportTemplate } from './commission-import-template';
import { CommissionsFacade } from '../../../modules/commission-board/+state/commissions.facade';
import { List } from '../../../modules/list/model/list';
import { Commission } from '../../../modules/commission-board/model/commission';
import { CommissionTag } from '../../../modules/commission-board/model/commission-tag';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';


@Component({
  selector: 'app-commission-import',
  templateUrl: './commission-import.component.html',
  styleUrls: ['./commission-import.component.less']
})
export class CommissionImportComponent {

  public template$: Observable<CommissionImportTemplate>;

  wrongFormat = false;

  constructor(private route: ActivatedRoute, private listPicker: ListPickerService,
              private dataService: DataService, private router: Router,
              private listManager: ListManagerService, private progressService: ProgressPopupService,
              private listsFacade: ListsFacade, private http: HttpClient, private linkTools: LinkToolsService,
              private commissionsFacade: CommissionsFacade, private lazyData: LazyDataFacade) {

    // To test: http://localhost:4200/import/MjA1NDUsbnVsbCwzOzE3OTYyLDMyMzA4LDE7MjAyNDcsbnVsbCwx&url=https://example.org
    this.template$ = combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([params, query]) => [params.get('importString'), query.get('url')]),
      withLazyData(this.lazyData, 'tradeFlags'),
      map(([[importString, url], tradeFlags]) => {
        const parsed = decodeURIComponent(escape(atob(importString)));
        if (parsed.indexOf(',') === -1) {
          this.wrongFormat = true;
          return { name: 'Invalid', price: 0, tags: [], items: [], url: url };
        }
        const exploded = parsed.split('|');
        const itemsStr = exploded[3].split(';');
        return {
          name: exploded[0],
          price: +exploded[1],
          tags: exploded[2].split(',').filter(t => CommissionTag[t] !== undefined) as CommissionTag[],
          items: itemsStr
            .map(row => {
              const rowContent = row.split(',');
              const itemId = +rowContent[0];
              const recipeId = rowContent[1] === '' || rowContent[1] === 'null' ? null : rowContent[1];
              const quantity = +rowContent[2];
              return {
                itemId: itemId,
                recipeId: recipeId,
                quantity: quantity
              };
            })
            .filter(i => {
              // Remove items that cannot be traded
              return tradeFlags[i.itemId];
            }),
          description: exploded[4] || '',
          url: url
        };
      }),
      switchMap(parsed => {
        if (parsed.items.length === 0) {
          return of(parsed);
        }
        return combineLatest((parsed.items as any[]).map(row => {
            return this.dataService.getItem(row.itemId).pipe(
              map(itemData => {
                const res: any = {
                  itemData: itemData,
                  recipeId: row.recipeId,
                  quantity: row.quantity
                };
                if (res.recipeId === null && itemData.isCraft()) {
                  res.recipeId = itemData.item.craft[0].id.toString();
                }
                return res;
              })
            );
          })
        ).pipe(
          map(items => {
            return {
              ...parsed,
              items: items as any[]
            };
          })
        );
      })
    );
  }

  canDoImport(data: CommissionImportTemplate): boolean {
    return data.items.length > 0 && data.items.every(row => !row.itemData.isCraft() || row.recipeId !== null);
  }

  doImport(data: CommissionImportTemplate): void {
    this.listsFacade.loadMyLists();
    const list = new List();
    list.name = data.name;
    const operations = data.items.map(item => {
      return this.listManager.addToList({
        itemId: item.itemData.item.id,
        list: list,
        recipeId: item.recipeId,
        amount: item.quantity
      });
    });
    let operation$: Observable<any>;
    if (operations.length > 0) {
      operation$ = concat(
        ...operations
      );
    } else {
      operation$ = of(list);
    }
    this.progressService.showProgress(operation$,
      data.items.length,
      'Adding_recipes',
      { amount: data.items.length, listname: list.name })
      .pipe(
        switchMap(l => {
          return this.listsFacade.addListAndWait(l);
        })
      )
      .subscribe(resList => {
        const template: Partial<Commission> = {
          ...data,
          items: data.items.map(i => {
            return {
              amount: i.quantity,
              id: i.itemData.item.id,
              done: 0
            };
          })
        };
        this.commissionsFacade.create(resList, template);
      });
  }

}
