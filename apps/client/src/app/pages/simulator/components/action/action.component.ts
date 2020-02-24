import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CraftingAction, Simulation, StepState } from '@ffxiv-teamcraft/simulator';
import { NzDropdownContextComponent, NzDropdownService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { SimulationService } from '../../../../core/simulation/simulation.service';
import { SettingsService } from 'apps/client/src/app/modules/settings/settings.service';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionComponent {

  @Output()
  actionclick: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  stepstate: EventEmitter<StepState> = new EventEmitter<StepState>();

  @Input()
  action: CraftingAction;

  @Input()
  simulation: Simulation;

  @Input()
  wasted = false;

  @Input()
  disabled = false;

  @Input()
  notEnoughCp = false;

  @Input()
  jobId: number;

  @Input()
  hideCost = false;

  @Input()
  ignoreDisabled = false;

  @Input()
  cpCost: number;

  @Input()
  failed = false;

  @Input()
  tooltipDisabled = false;

  @Input()
  safe = true;

  @Input()
  state: StepState;

  @Input()
  showStateMenu = false;

  public states = StepState;

  private dropdown: NzDropdownContextComponent;

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  private get registry() {
    return this.simulator.CraftingActionsRegistry;
  }

  constructor(private nzDropdownService: NzDropdownService, private settings: SettingsService,
              private simulationService: SimulationService) {
  }

  getAlt(): string {
    return this.registry.ALL_ACTIONS.find(a => a.action.getIds()[0] === this.action.getIds()[0]).name;
  }

  getJobId(): number {
    return this.simulation !== undefined ? this.simulation.crafterStats.jobId : this.jobId;
  }

  contextMenu($event: MouseEvent, template: TemplateRef<void>): void {
    this.dropdown = this.nzDropdownService.create($event, template);
  }

  setState(state: StepState): void {
    this.stepstate.next(state);
  }

  close(): void {
    this.dropdown.close();
  }

  getColor(state: StepState): string {
    switch (state) {
      case StepState.EXCELLENT:
        return 'cyan';
      case StepState.GOOD:
        return 'orange';
      case StepState.POOR:
        return 'purple';
      case StepState.FAILED:
        return 'red';
    }
  }
}
