import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Simulation} from 'app/pages/simulator/simulation/simulation';

@Component({
    selector: 'app-simulation-min-stats-popup',
    templateUrl: './simulation-min-stats-popup.component.html',
    styleUrls: ['./simulation-min-stats-popup.component.scss']
})
export class SimulationMinStatsPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public simulation: Simulation) {
    }

}
