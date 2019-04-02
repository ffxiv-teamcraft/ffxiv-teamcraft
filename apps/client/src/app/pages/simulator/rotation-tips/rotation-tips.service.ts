import { Inject, Injectable } from '@angular/core';
import { SimulationResult } from '../simulation/simulation-result';
import { RotationTip } from './rotation-tip';
import { Class, Instantiable } from '@kaiu/serializer';
import { ROTATION_TIPS } from './rotation-tips.module';

@Injectable({
  providedIn: 'root'
})
export class RotationTipsService {

  private tips: RotationTip[] = [];

  constructor(@Inject(ROTATION_TIPS) tipClasses: Class<RotationTip>[]) {
    this.tips = tipClasses.map(clazz => new (<Instantiable>clazz)());
  }

  public getTips(result: SimulationResult): RotationTip[] {
    if (result.steps.length === 0) {
      return [];
    }
    return this.tips
      .filter(tip => tip.canBeAppliedTo(result))
      .filter(tip => tip.matches(result));
  }
}
