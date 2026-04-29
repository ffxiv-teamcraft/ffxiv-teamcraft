import { Injectable, inject } from '@angular/core';
import { SimulationResult } from '@ffxiv-teamcraft/simulator';
import { RotationTip } from './rotation-tip';
import { Class, Instantiable } from '@kaiu/serializer';
import { ROTATION_TIPS } from './rotation-tips.module';

@Injectable({
  providedIn: 'root'
})
export class RotationTipsService {
  private tips = inject(ROTATION_TIPS);


  public getTips(result: SimulationResult): RotationTip[] {
    if (result.steps.length === 0) {
      return [];
    }
    return this.tips
      .map(clazz => new (<Instantiable>clazz)())
      .filter(tip => tip.canBeAppliedTo(result))
      .filter(tip => tip.matches(result));
  }
}
