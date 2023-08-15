import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyRecipesPerItem } from '@ffxiv-teamcraft/data/model/lazy-recipes-per-item';

interface ImportData {
  items: { id: number, recipes?: LazyRecipesPerItem[], quantity: number, recipeId?: string }[],
  url: string
}

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.less']
})
export class ImportComponent {

  public items$: Observable<ImportData>;

  wrongFormat = false;

  constructor(private route: ActivatedRoute, private listPicker: ListPickerService,
              private lazyData: LazyDataFacade, private router: Router,
              private http: HttpClient, private linkTools: LinkToolsService) {

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
      const callbackUrl = this.route.snapshot.queryParamMap.get('callback');
      if (callbackUrl !== null) {
        this.http.post(callbackUrl, { url: this.linkTools.getLink(`/list/${list.$key}`) }).subscribe();
      }
      this.router.navigate(['list', list.$key]);
    });
  }

}
