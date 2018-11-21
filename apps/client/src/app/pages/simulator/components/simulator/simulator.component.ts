import { Component } from '@angular/core';
import { CraftingAction } from '../../model/actions/crafting-action';
import { ActionType } from '../../model/actions/action-type';
import { CraftingActionsRegistry } from '../../model/crafting-actions-registry';
import { Simulation } from '../../simulation/simulation';
import { alc_70_350_stats, gradeII_infusion_of_str_Recipe } from '../../test/mocks';
import { of } from 'rxjs';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less']
})
export class SimulatorComponent {

  public snapshotMode = false;

  public tooltipsDisabled = false;

  //TODO
  public result$;

  constructor(private registry: CraftingActionsRegistry) {
    const mock = new Simulation(gradeII_infusion_of_str_Recipe, [], alc_70_350_stats);
    this.result$ = of(mock.run());
  }

  addAction(action: CraftingAction) {
    // TODO
  }

  getProgressActions(): CraftingAction[] {
    return this.registry.getActionsByType(ActionType.PROGRESSION);
  }

  getQualityActions(): CraftingAction[] {
    return this.registry.getActionsByType(ActionType.QUALITY);
  }

  getCpRecoveryActions(): CraftingAction[] {
    return this.registry.getActionsByType(ActionType.CP_RECOVERY);
  }

  getBuffActions(): CraftingAction[] {
    return this.registry.getActionsByType(ActionType.BUFF);
  }

  getSpecialtyActions(): CraftingAction[] {
    return this.registry.getActionsByType(ActionType.SPECIALTY);
  }

  getRepairActions(): CraftingAction[] {
    return this.registry.getActionsByType(ActionType.REPAIR);
  }

  getOtherActions(): CraftingAction[] {
    return this.registry.getActionsByType(ActionType.OTHER);
  }

}
