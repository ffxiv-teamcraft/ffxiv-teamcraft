import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CraftingAction} from '../../model/actions/crafting-action';
import {Simulation} from '../../simulation/simulation';

@Component({
    selector: 'app-action',
    templateUrl: './action.component.html',
    styleUrls: ['./action.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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

    getJobId(): number {
        return this.simulation !== undefined ? this.simulation.crafterStats.jobId : this.jobId;
    }
}
