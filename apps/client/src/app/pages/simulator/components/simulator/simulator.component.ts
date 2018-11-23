import { Component } from '@angular/core';
import { CraftingAction } from '../../model/actions/crafting-action';
import { ActionType } from '../../model/actions/action-type';
import { CraftingActionsRegistry } from '../../model/crafting-actions-registry';
import { Simulation } from '../../simulation/simulation';
import { gradeII_infusion_of_str_Recipe } from '../../test/mocks';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { CrafterStats } from '../../model/crafter-stats';
import { SimulationResult } from '../../simulation/simulation-result';
import { EffectiveBuff } from '../../model/effective-buff';
import { Buff } from '../../model/buff.enum';
import { Craft } from '../../../../model/garland-tools/craft';
import { map } from 'rxjs/operators';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { SimulationReliabilityReport } from '../../simulation/simulation-reliability-report';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less']
})
export class SimulatorComponent {

  public snapshotMode = false;

  public tooltipsDisabled = false;

  //TODO
  public result$: Observable<SimulationResult>;

  private actions$ = new BehaviorSubject<CraftingAction[]>([]);

  private stats$ = new ReplaySubject<CrafterStats>();

  private recipe$ = new ReplaySubject<Craft>();

  private simulation$: Observable<Simulation>;

  public report$: Observable<SimulationReliabilityReport>;

  constructor(private registry: CraftingActionsRegistry, private htmlTools: HtmlToolsService) {
    this.recipe$.next(gradeII_infusion_of_str_Recipe);
    const mockStats = new CrafterStats(
      14,
      1544,
      1586,
      485,
      true,
      70,
      [
        70,
        70,
        70,
        70,
        70,
        70,
        70,
        70
      ]);
    this.stats$.next(mockStats);
    this.simulation$ = combineLatest(this.recipe$, this.actions$, this.stats$).pipe(
      map(([recipe, actions, stats]) => new Simulation(recipe, actions, stats))
    );
    this.result$ = this.simulation$.pipe(map(sim => sim.run(true)));
    this.report$ = combineLatest(this.simulation$, this.result$).pipe(
      map(([simulation, result]) => {
        if (!result.success) {
          return {
            averageHQPercent: 0,
            medianHQPercent: 0,
            rawData: [],
            successPercent: 0
          };
        }
      })
    );
  }

  addAction(action: CraftingAction, index?: number) {
    if (index === undefined) {
      this.actions$.next([...this.actions$.value, action]);
    } else {
      const actions = this.actions$.value;
      actions.splice(index, 0, action);
      this.actions$.next([...actions]);
    }
  }

  actionDrop(event: any): void {
    this.addAction(event.value, event.dropIndex);
  }

  removeAction(index: number): void {
    console.log('remove', index);
    const actions = this.actions$.value;
    actions.splice(index, 1);
    this.actions$.next([...actions]);
  }

  barFormat(current: number, max: number): () => string {
    return () => `${current}/${max}`;
  }

  getStars(stars: number): string {
    return this.htmlTools.generateStars(stars);
  }

  getBuffIcon(effBuff: EffectiveBuff): string {
    return `./assets/icons/status/${Buff[effBuff.buff].toLowerCase()}.png`;
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
