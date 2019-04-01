import { SimulationResult } from '../simulation/simulation-result';
import { InnerQuiet } from '../model/actions/buff/inner-quiet';

export class RotationTip {

  private static readonly USE_INNER_QUIET = new RotationTip((result) => {
    return !result.steps.some(step => step.action.is(InnerQuiet));
  }, 'SIMULATOR.ROTATION_TIPS.Use_inner_quiet');

  public static get ALL_TIPS(): RotationTip[] {
    return Object.keys(RotationTip)
      .filter(key => ['ALL_TIPS'].indexOf(key) === -1)
      .map(key => RotationTip[key]);
  }

  private constructor(public readonly matches: (simulationResult: SimulationResult) => boolean,
                      public readonly message: string,
                      public readonly messageParams?: (simulationResult: SimulationResult) => any) {
  }
}
