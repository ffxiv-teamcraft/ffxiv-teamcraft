import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ItemData } from '../../../model/garland-tools/item-data';
import { combineLatest, concat, Observable } from 'rxjs';
import { filter, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.less']
})
export class ImportComponent {

  public items$: Observable<{ itemData: ItemData, quantity: number, recipeId?: string }[]>;

  wrongFormat = false;

  constructor(private route: ActivatedRoute, private listPicker: ListPickerService,
              private dataService: DataService, private router: Router,
              private listManager: ListManagerService, private progressService: ProgressPopupService,
              private listsFacade: ListsFacade) {

    // To test: http://localhost:4200/import/MjA1NDUsbnVsbCwzOzE3OTYyLDMyMzA4LDE7MjAyNDcsbnVsbCwx
    this.items$ = this.route.paramMap.pipe(
      map(params => params.get('importString')),
      map(importString => {
        const parsed = atob(importString);
        if (parsed.indexOf(',') === -1) {
          this.wrongFormat = true;
          return [];
        }
        const exploded = parsed.split(';');
        return exploded.map(row => {
          const rowContent = row.split(',');
          const itemId = +rowContent[0];
          const recipeId = rowContent[1] === 'null'?null:rowContent[1];
          const quantity = +rowContent[2];
          return {
            itemId: itemId,
            recipeId: recipeId,
            quantity: quantity
          };
        });
      }),
      switchMap(rows => {
        return combineLatest(rows.map(row => {
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
        }));
      })
    );
  }

  canDoImport(data: { itemData: ItemData, quantity: number, recipeId?: string }[]): boolean {
    return data.reduce((valid, row) => {
      return valid && (!row.itemData.isCraft() || row.recipeId !== null);
    }, true);
  }

  doImport(data: { itemData: ItemData, quantity: number, recipeId?: string }[]): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operation$ = concat(
          ...data.map(row => {
            return this.listManager.addToList(row.itemData.item.id, list, +row.recipeId, row.quantity);
          })
        );
        return this.progressService.showProgress(operation$,
          data.length,
          'Adding_recipes',
          { amount: data.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest(this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt === list.createdAt && l.$key === list.$key && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list) => {
      this.router.navigate(['list', list.$key]);
    });
  }

}
