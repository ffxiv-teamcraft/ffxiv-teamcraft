import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CraftingAction, Simulation, StepState } from '@ffxiv-teamcraft/simulator';
import { SimulationService } from '../../../../core/simulation/simulation.service';
import { SettingsService } from 'apps/client/src/app/modules/settings/settings.service';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';

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

  @Output()
  failChange: EventEmitter<boolean> = new EventEmitter<boolean>();

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

  @Input()
  readonly = false;

  public states = StepState;

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  private get registry() {
    return this.simulator.CraftingActionsRegistry;
  }

  constructor(private nzDropdownService: NzContextMenuService, private settings: SettingsService,
              private simulationService: SimulationService) {
  }

  getAlt(): string {
    return this.registry.ALL_ACTIONS.find(a => a.action.getIds()[0] === this.action.getIds()[0]).name;
  }

  getJobId(): number {
    return this.simulation !== undefined ? this.simulation.crafterStats.jobId : this.jobId;
  }

  contextMenu($event: MouseEvent, template: NzDropdownMenuComponent): void {
    this.nzDropdownService.create($event, template);
  }

  setState(state: StepState): void {
    this.stepstate.next(state);
  }

  close(): void {
    this.nzDropdownService.close();
  }

  getColor(state: StepState): string {
    switch (state) {
      case StepState.EXCELLENT:
        return 'cyan';
      case StepState.GOOD:
        return 'orange';
      case StepState.STURDY:
        return 'blue';
      case StepState.PLIANT:
        return 'green';
      case StepState.CENTERED:
        return 'yellow';
      case StepState.POOR:
        return 'purple';
    }
  }
}
