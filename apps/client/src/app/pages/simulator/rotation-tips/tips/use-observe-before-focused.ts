import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { FocusedSynthesis, FocusedTouch, Observe, SimulationResult } from '@ffxiv-teamcraft/simulator';

export class UseObserveBeforeFocused extends RotationTip {

  private matchingIndex: number;

  constructor() {
    super(RotationTipType.WARNING, 'Use_observe_before_focused');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, FocusedSynthesis) || this.simulationHasAction(simulationResult, FocusedTouch);
  }

  matches(simulationResult: SimulationResult): boolean {
    const focusedSynthIndexes = this.getAllActionIndexes(simulationResult, FocusedSynthesis);
    const focusedTouchIndexes = this.getAllActionIndexes(simulationResult, FocusedTouch);
    return [...focusedSynthIndexes, ...focusedTouchIndexes].some(index => {
      if (index === 0) {
        this.matchingIndex = 1;
        return true;
      }
      const result = !simulationResult.steps[index - 1].action.is(Observe);
      if (result) {
        this.matchingIndex = index + 1;
      }
      return result;
    });
  }

  messageParams(simulationResult: SimulationResult): any {
    return { index: this.matchingIndex };
  }

}
