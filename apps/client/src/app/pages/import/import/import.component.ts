import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ItemData } from '../../../model/garland-tools/item-data';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.less']
})
export class ImportComponent {

  public items$: Observable<{ itemData: ItemData, quantity: number, recipeId?: string }[]>;

  wrongFormat = false;

  constructor(private route: ActivatedRoute, private listPicker: ListPickerService,
              private dataService: DataService) {

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
          const recipeId = rowContent[1];
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

              // if (res.recipeId === 'null' && itemData.isCraft()) {
              //   res.recipeId = itemData.item.craft[0].id.toString();
              // }
              return res;
            })
          );
        }));
      })
    );
  }

  canDoImport(data: { itemData: ItemData, quantity: number, recipeId?: string }[]): boolean {
    return data.reduce((valid, row) => {
      return valid && (!row.itemData.isCraft() || row.recipeId !== 'null');
    }, true);
  }

  doImport(data: { itemData: ItemData, quantity: number, recipeId?: string }[]): void {
    //TODO
  }

}
