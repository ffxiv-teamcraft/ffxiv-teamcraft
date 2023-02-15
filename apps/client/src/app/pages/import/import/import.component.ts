import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ItemData } from '../../../model/garland-tools/item-data';
import { combineLatest, concat, Observable } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { HttpClient } from '@angular/common/http';
import { LinkToolsService } from '../../../core/tools/link-tools.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.less']
})
export class ImportComponent {

  public items$: Observable<{ items: { itemData: ItemData, quantity: number, recipeId?: string }[], url: string }>;

  wrongFormat = false;

  constructor(private route: ActivatedRoute, private listPicker: ListPickerService,
              private dataService: DataService, private router: Router,
              private listManager: ListManagerService, private progressService: ProgressPopupService,
              private listsFacade: ListsFacade, private http: HttpClient, private linkTools: LinkToolsService) {

    // To test: http://localhost:4200/import/MjA1NDUsbnVsbCwzOzE3OTYyLDMyMzA4LDE7MjAyNDcsbnVsbCwx&url=https://example.org
    this.items$ = combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([params, query]) => [params.get('importString'), query.get('url')]),
      map(([importString, url]) => {
        const parsed = atob(importString);
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
          return this.dataService.getItem(row.itemId).pipe(
            map(itemData => {
              const res = {
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

  canDoImport(data: { items: { itemData: ItemData, quantity: number, recipeId?: string }[], url: string }): boolean {
    return data.items.reduce((valid, row) => {
      return valid && (!row.itemData.isCraft() || row.recipeId !== null);
    }, true);
  }

  doImport(data: { items: { itemData: ItemData, quantity: number, recipeId?: string }[], url: string }): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        list.$key = list.$key || this.listsFacade.createId();
        if (data.url) {
          list.note = data.url;
        }
        const operation$ = concat(
          ...data.items.map(row => {
            return this.listManager.addToList({
              itemId: row.itemData.item.id,
              list: list,
              recipeId: +row.recipeId,
              amount: row.quantity
            });
          })
        );
        return this.progressService.showProgress(operation$,
          data.items.length,
          'Adding_recipes',
          { amount: data.items.length, listname: list.name });
      }),
      tap(list => this.listsFacade.updateList(list))
    ).subscribe((list) => {
      const callbackUrl = this.route.snapshot.queryParamMap.get('callback');
      if (callbackUrl !== null) {
        this.http.post(callbackUrl, { url: this.linkTools.getLink(`/list/${list.$key}`) }).subscribe();
      }
      this.router.navigate(['list', list.$key]);
    });
  }

}
