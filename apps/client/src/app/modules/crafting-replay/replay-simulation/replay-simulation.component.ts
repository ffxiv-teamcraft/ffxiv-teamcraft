import { ChangeDetectionStrategy, Component, Input, Optional } from '@angular/core';
import { CraftingReplay } from '../model/crafting-replay';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { BehaviorSubject, combineLatest, ReplaySubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { ActionResult, EffectiveBuff, SimulationService } from '../../../core/simulation/simulation.service';
import { SettingsService } from '../../settings/settings.service';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-replay-simulation',
  templateUrl: './replay-simulation.component.html',
  styleUrls: [
    '../../../pages/simulator/components/simulator/simulator.component.less',
    './replay-simulation.component.less'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReplaySimulationComponent {

  public replay$: ReplaySubject<CraftingReplay> = new ReplaySubject<CraftingReplay>();

  public snapshotStep$: BehaviorSubject<number> = new BehaviorSubject<number>(Infinity);

  public actionFailed = false;

  @Input()
  set replay(replay: CraftingReplay) {
    this.replay$.next(replay);
  }

  public simulation$ = this.replay$.pipe(
    switchMap(replay => {
      return this.lazyData.getRecipe(replay.recipeId.toString()).pipe(
        map(recipe => {
          return new this.simulator.Simulation(
            recipe,
            this.simulator.CraftingActionsRegistry.createFromIds(replay.steps.map(step => step.action)),
            replay.playerStats,
            [],
            replay.steps.reduce((states, step, index) => {
              return {
                ...states,
                [index]: step.state
              };
            }, {}),
            replay.steps
              .map((step, index) => {
                return {
                  success: step.success,
                  index: index
                };
              })
              .filter(step => !step.success)
              .map(step => step.index)
          );
        })
      );
    })
  );

  public result$ = combineLatest([this.simulation$, this.snapshotStep$]).pipe(
    map(([simulation, snapshotStep]) => {
      simulation.reset();
      return simulation.run(true, snapshotStep);
    }),
    tap(result => {
      this.actionFailed = result.steps.find(step => !step.success) !== undefined;
    })
  );

  public report$ = this.simulation$.pipe(
    map(simulation => simulation.getReliabilityReport())
  );

  public item$ = this.replay$.pipe(
    switchMap(replay => {
      return this.dataService.getItem(replay.itemId);
    })
  );

  public qualityPer100$ = this.result$.pipe(
    map(result => {
      const action = new this.simulator.BasicTouch();
      return Math.floor(action.getBaseQuality(result.simulation));
    })
  );

  public progressPer100$ = this.result$.pipe(
    map(result => {
      const action = new this.simulator.BasicSynthesis();
      return Math.floor(action.getBaseProgression(result.simulation));
    })
  );

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  constructor(private lazyData: LazyDataService, private dataService: DataService,
              private simulationService: SimulationService, private settings: SettingsService,
              @Optional() public ref: NzModalRef) {
  }

  getBuffIcon(effBuff: EffectiveBuff): string {
    return `./assets/icons/status/${this.simulator.Buff[effBuff.buff].toLowerCase()}.png`;
  }

  trackByAction(index: number, step: ActionResult): number {
    return step.action.getId(8);
  }

}
