import { Injectable } from '@angular/core';
import { SimulationResult } from '../simulation/simulation-result';
import { RotationTip } from './rotation-tip';

@Injectable({
  providedIn: 'root'
})
export class RotationTipsService {
  public getTips(result: SimulationResult): RotationTip[] {
    return RotationTip.ALL_TIPS.filter(tip => {
      return tip.matches(result);
    });
  }
}
