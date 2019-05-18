import { Injectable } from '@angular/core';
import { NzDrawerService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { RotationPickerDrawerComponent } from './rotation-picker-drawer/rotation-picker-drawer.component';
import { Craft } from '../../model/garland-tools/craft';

@Injectable({
  providedIn: 'root'
})
export class RotationPickerService {

  constructor(private nzDrawer: NzDrawerService, private translate: TranslateService) {
  }

  openInSimulator(itemId: number, recipeId: string, recipe?: Partial<Craft>, disableNew = false, custom = false): void {
    this.nzDrawer.create<RotationPickerDrawerComponent, Partial<RotationPickerDrawerComponent>, null>({
      nzContent: RotationPickerDrawerComponent,
      nzContentParams: {
        itemId: itemId,
        recipeId: recipeId,
        disableNew: disableNew,
        custom: custom,
        recipe: recipe
      },
      nzTitle: this.translate.instant('Pick_a_rotation')
    });
  }
}
