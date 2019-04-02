import { Injectable } from '@angular/core';
import { SimulationResult } from '../simulation/simulation-result';
import { RotationTip } from './rotation-tip';

@Injectable({
  providedIn: 'root'
})
export class RotationTipsService {
  public getTips(result: SimulationResult): RotationTip[] {
    if (result.steps.length === 0) {
      return [];
    }
    return RotationTip.ALL_TIPS
      .filter(tip => tip.canBeAppliedTo(result))
      .filter(tip => tip.matches(result));
  }
}
