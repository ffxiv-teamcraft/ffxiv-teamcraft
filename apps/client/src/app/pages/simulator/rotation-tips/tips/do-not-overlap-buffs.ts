import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { Buff, BuffAction, SimulationResult } from '@ffxiv-teamcraft/simulator';

export class DoNotOverlapBuffs extends RotationTip {
  private overlappedIndex: number;

  private overlappingIndex: number;

  constructor() {
    super(RotationTipType.WARNING, 'Do_not_overlap_buffs');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, BuffAction);
  }

  matches(simulationResult: SimulationResult): boolean {
    const buffIndexes = this.getAllActionIndexes(simulationResult, BuffAction);
    const buffs: { [index: number]: number[] } = {};
    buffIndexes.forEach(index => {
      const buffEntry = (<BuffAction>simulationResult.simulation.actions[index]);
      buffEntry.getOverrides().forEach(override => {
        if (buffs[override] === undefined) {
          buffs[override] = [];
        }
        buffs[override].push(index);
      });
    });
    // we only want to take buffs that may overlap into consideration.
    return Object.keys(buffs)
      .filter(key => {
        return buffs[key].length > 1;
      })
      .some(key => {
        const override = +key as Buff;
        return buffs[key].some((row, index) => {
          // First one can't overlap anything, skip !
          if (index === 0) {
            return false;
          }
          const clone = simulationResult.simulation.clone();
          clone.run(true, row);
          const matches = clone.buffs.some(buff => {
            return buff.buff === override;
          });
          if (matches) {
            this.overlappedIndex = buffs[key][index - 1];
            this.overlappingIndex = row;
          }
          return matches;
        });
      });

  }

  messageParams(simulationResult: SimulationResult): any {
    return { overlappedIndex: this.overlappedIndex, overlappingIndex: this.overlappingIndex };
  }

}
