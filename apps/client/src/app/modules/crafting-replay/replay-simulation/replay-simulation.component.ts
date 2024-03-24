import { ChangeDetectionStrategy, Component, Input, Optional } from '@angular/core';
import { CraftingReplay } from '../model/crafting-replay';
import { BehaviorSubject, combineLatest, ReplaySubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { ActionResult, Craft, EffectiveBuff, Simulation, SimulationService } from '../../../core/simulation/simulation.service';
import { SettingsService } from '../../settings/settings.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { MacroPopupComponent } from '../../../pages/simulator/components/macro-popup/macro-popup.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ActionComponent } from '../../../pages/simulator/components/action/action.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { SimulationResultComponent } from '../../../pages/simulator/components/simulation-result/simulation-result.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-replay-simulation',
    templateUrl: './replay-simulation.component.html',
    styleUrls: [
        '../../../pages/simulator/components/simulator/simulator.component.less',
        './replay-simulation.component.less'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, FlexModule, SimulationResultComponent, NzCardModule, NgFor, ActionComponent, NgSwitch, NgSwitchCase, NgSwitchDefault, NzButtonModule, NzWaveModule, AsyncPipe, TranslateModule]
})
export class ReplaySimulationComponent {

  public replay$: ReplaySubject<CraftingReplay> = new ReplaySubject<CraftingReplay>();

  public snapshotStep$: BehaviorSubject<number> = new BehaviorSubject<number>(Infinity);

  public actionFailed = false;

  public simulation$ = this.replay$.pipe(
    switchMap(replay => {
      return this.lazyData.getRecipe(replay.recipeId.toString()).pipe(
        map(recipe => {
          return new this.simulator.Simulation(
            recipe as unknown as Craft,
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

  constructor(private lazyData: LazyDataFacade, private dataService: DataService,
              private simulationService: SimulationService, private settings: SettingsService,
              @Optional() public ref: NzModalRef, private dialog: NzModalService,
              private translate: TranslateService) {
  }

  @Input()
  set replay(replay: CraftingReplay) {
    this.replay$.next(replay);
  }

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  openMacroPopup(simulation: Simulation): void {
    this.dialog.create({
      nzContent: MacroPopupComponent,
      nzData: {
        rotation: simulation.steps.map(step => step.action),
        job: simulation.crafterStats.jobId,
        simulation: simulation.clone(),
        food: null,
        medicine: null,
        freeCompanyActions: null
      },
      nzTitle: this.translate.instant('SIMULATOR.Generate_ingame_macro'),
      nzFooter: null
    });
  }

  getBuffIcon(effBuff: EffectiveBuff): string {
    return `./assets/icons/status/${this.simulator.Buff[effBuff.buff].toLowerCase()}.png`;
  }

  trackByAction(index: number, step: ActionResult): number {
    return step.action.getId(8);
  }

}
