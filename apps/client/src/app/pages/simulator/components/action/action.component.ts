import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CraftingAction, CraftingActionsRegistry, Simulation, StepState } from '@ffxiv-teamcraft/simulator';
import { NzDropdownContextComponent, NzDropdownService } from 'ng-zorro-antd';

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

  constructor(private nzDropdownService: NzDropdownService) {
  }

  getAlt(): string {
    return CraftingActionsRegistry.ALL_ACTIONS.find(a => a.action.getIds()[0] === this.action.getIds()[0]).name;
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
