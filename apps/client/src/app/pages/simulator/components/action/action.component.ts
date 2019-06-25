import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CraftingAction, Simulation } from '@ffxiv-teamcraft/simulator';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionComponent {

  @Output()
  actionclick: EventEmitter<void> = new EventEmitter<void>();

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

  getJobId(): number {
    return this.simulation !== undefined ? this.simulation.crafterStats.jobId : this.jobId;
  }
}
