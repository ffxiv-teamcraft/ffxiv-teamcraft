import { Injectable } from '@angular/core';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { TranslateService } from '@ngx-translate/core';
import { RotationPickerDrawerComponent } from './rotation-picker-drawer/rotation-picker-drawer.component';
import { Craft } from '../../model/garland-tools/craft';
import { CraftingRotation } from '../../model/other/crafting-rotation';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

@Injectable({
  providedIn: 'root'
})
export class RotationPickerService {

  constructor(private nzDrawer: NzDrawerService, private translate: TranslateService, private lazyData: LazyDataFacade) {
  }

  pickRotation(itemId: number, recipeId: string, recipe?: Partial<Craft>, statsStr?: string): Observable<CraftingRotation> {
    return this.nzDrawer.create<RotationPickerDrawerComponent, Partial<RotationPickerDrawerComponent>, CraftingRotation>({
      nzContent: RotationPickerDrawerComponent,
      nzContentParams: {
        itemId: itemId,
        recipeId: recipeId,
        disableNew: true,
        custom: false,
        recipe: recipe,
        pickOnly: true,
        statsStr: statsStr
      },
      nzTitle: this.translate.instant('Pick_a_rotation')
    }).afterClose;
  }

  openInSimulator(itemId: number, recipeId: string, disableNew = false, custom = false, statsStr?: string): void {
    const recipeData$ = this.lazyData.getRecipe(recipeId);
    recipeData$
      .pipe(first())
      .subscribe(recipeData => {
        this.nzDrawer.create<RotationPickerDrawerComponent, Partial<RotationPickerDrawerComponent>, null>({
          nzContent: RotationPickerDrawerComponent,
          nzContentParams: {
            itemId: itemId,
            recipeId: recipeId,
            disableNew: disableNew,
            custom: custom,
            recipe: {
              ...recipeData,
              id: recipeData.id.toString(),
              hq: recipeData.hq ? 1 : 0
            },
            statsStr: statsStr
          },
          nzTitle: this.translate.instant('Pick_a_rotation')
        });
      });
  }
}
