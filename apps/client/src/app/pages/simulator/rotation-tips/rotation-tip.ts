import { SimulationResult } from '../simulation/simulation-result';
import { InnerQuiet } from '../model/actions/buff/inner-quiet';
import { RotationTipType } from './rotation-tip-type';

export class RotationTip {

  private static readonly USE_INNER_QUIET = new RotationTip(
    (result) => {
      return !result.steps.some(step => step.action.is(InnerQuiet));
    },
    RotationTipType.WARNING,
    'SIMULATOR.ROTATION_TIPS.Use_inner_quiet'
  );

  private static readonly USE_INNER_QUIET_BEFORE_QUALITY_INCREASE = new RotationTip(
    (result) => {
      const iqIndex = result.steps.findIndex(step => step.action.is(InnerQuiet));
      const firstQualityAction = result.steps.findIndex(step => step.addedQuality > 0);
      return iqIndex > firstQualityAction;
    },
    RotationTipType.WARNING,
    'SIMULATOR.ROTATION_TIPS.Use_inner_quiet_before_quality_increase'
  );

  public static get ALL_TIPS(): RotationTip[] {
    return Object.keys(RotationTip)
      .filter(key => ['ALL_TIPS'].indexOf(key) === -1)
      .map(key => RotationTip[key]);
  }

  private constructor(public readonly matches: (simulationResult: SimulationResult) => boolean,
                      public readonly type: RotationTipType,
                      public readonly message: string,
                      public readonly messageParams: (simulationResult: SimulationResult) => any = () => {
                      }) {
  }
}
