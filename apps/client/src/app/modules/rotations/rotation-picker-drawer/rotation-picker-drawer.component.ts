import { Component } from '@angular/core';
import { RotationsFacade } from '../+state/rotations.facade';
import { NzDrawerRef } from 'ng-zorro-antd';
import { CraftingRotation } from '../../../model/other/crafting-rotation';

@Component({
  selector: 'app-rotation-picker-drawer',
  templateUrl: './rotation-picker-drawer.component.html',
  styleUrls: ['./rotation-picker-drawer.component.less']
})
export class RotationPickerDrawerComponent {

  rotations$ = this.rotationsFacade.myRotations$;

  public itemId: number;

  public recipeId: string;

  public disableNew = false;

  public custom = false;

  constructor(private rotationsFacade: RotationsFacade, public ref: NzDrawerRef<CraftingRotation>) {
  }
}
