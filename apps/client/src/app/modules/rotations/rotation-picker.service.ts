import { Injectable } from '@angular/core';
import { NzDrawerService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { RotationPickerDrawerComponent } from './rotation-picker-drawer/rotation-picker-drawer.component';
import { Craft } from '../../model/garland-tools/craft';
import { CraftingRotation } from '../../model/other/crafting-rotation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RotationPickerService {

  constructor(private nzDrawer: NzDrawerService, private translate: TranslateService) {
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

  openInSimulator(itemId: number, recipeId: string, recipe?: Partial<Craft>, disableNew = false, custom = false, statsStr?: string): void {
    this.nzDrawer.create<RotationPickerDrawerComponent, Partial<RotationPickerDrawerComponent>, null>({
      nzContent: RotationPickerDrawerComponent,
      nzContentParams: {
        itemId: itemId,
        recipeId: recipeId,
        disableNew: disableNew,
        custom: custom,
        recipe: recipe,
        statsStr: statsStr
      },
      nzTitle: this.translate.instant('Pick_a_rotation')
    });
  }
}
