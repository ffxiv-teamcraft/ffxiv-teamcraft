import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CraftingAction, Simulation, StepState } from '@ffxiv-teamcraft/simulator';
import { SimulationService } from '../../../../core/simulation/simulation.service';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { NzContextMenuService, NzDropdownMenuComponent, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { XivapiIconPipe } from '../../../../pipes/pipes/xivapi-icon.pipe';
import { AbsolutePipe } from '../../../../pipes/pipes/absolute.pipe';
import { ActionIconPipe } from '../../../../pipes/pipes/action-icon.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { XivapiActionTooltipDirective } from '../../../../modules/tooltip/xivapi-action-tooltip/xivapi-action-tooltip.directive';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NgIf, NgClass, NgFor } from '@angular/common';

@Component({
    selector: 'app-action',
    templateUrl: './action.component.html',
    styleUrls: ['./action.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzBadgeModule, XivapiActionTooltipDirective, NgClass, ExtendedModule, NzDropDownModule, NzMenuModule, NgFor, NzButtonModule, TranslateModule, ActionIconPipe, AbsolutePipe, XivapiIconPipe]
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
  state: StepState = StepState.NORMAL;

  @Input()
  showStateMenu = false;

  @Input()
  readonly = false;

  availableConditions: { condition: number, name: string }[] = [];

  constructor(private nzDropdownService: NzContextMenuService, private settings: SettingsService,
              private simulationService: SimulationService) {
  }

  private _simulation: Simulation;

  get simulation(): Simulation {
    return this._simulation;
  }

  @Input()
  set simulation(simulation: Simulation) {
    this._simulation = simulation;
    this.computeAvailableConditions();
  }

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  private get registry() {
    return this.simulator.CraftingActionsRegistry;
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
        return 'violet';
      case StepState.MALLEABLE:
        return 'darkblue';
      case StepState.PRIMED:
        return 'darkmagenta';
      case StepState.GOOD_OMEN:
        return 'gold';
    }
  }

  private computeAvailableConditions(): void {
    this.availableConditions = (this.simulation.possibleConditions || [StepState.NORMAL, StepState.GOOD, StepState.EXCELLENT, StepState.POOR]).map(condition => {
      return {
        condition,
        name: `${StepState[condition].slice(0, 1)}${StepState[condition].slice(1).toLowerCase()}`
      };
    });
  }
}
