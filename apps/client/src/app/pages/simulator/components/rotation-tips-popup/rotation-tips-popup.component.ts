import { Component } from '@angular/core';
import { RotationTip } from '../../rotation-tips/rotation-tip';
import { SimulationResult } from '@ffxiv-teamcraft/simulator';

@Component({
  selector: 'app-rotation-tips-popup',
  templateUrl: './rotation-tips-popup.component.html',
  styleUrls: ['./rotation-tips-popup.component.less']
})
export class RotationTipsPopupComponent {

  public tips: RotationTip[] = [];

  result: SimulationResult;
}
