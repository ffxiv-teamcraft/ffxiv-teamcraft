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

  public items$: Observable<{ item: ItemData, quantity: number, recipeId?: string }[]>;

  wrongFormat = false;

  constructor(private route: ActivatedRoute, private listPicker: ListPickerService,
              private dataService: DataService) {
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
          }
        });
      }),
      switchMap(rows => {
        return combineLatest(rows.map(row => {
          return this.dataService.getItem(row.itemId).pipe(
            map(itemData => {
              return {
                item: itemData,
                recipeId: row.recipeId,
                quantity: row.quantity
              }
            })
          )
        }))
      })
    );
  }

}
