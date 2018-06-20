import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {SimulationResult} from '../../simulation/simulation-result';
import {ObservableMedia} from '@angular/flex-layout';

@Component({
    selector: 'app-step-by-step-report-popup',
    templateUrl: './step-by-step-report-popup.component.html',
    styleUrls: ['./step-by-step-report-popup.component.scss']
})
export class StepByStepReportPopupComponent {

    dataSource: any[];

    columnsToDisplay = this.isMobile() ? ['position', 'cpDifference', 'solidityDifference', 'addedQuality', 'addedProgression'] :
        ['position', 'action', 'cpDifference', 'solidityDifference', 'addedQuality', 'addedProgression'];

    constructor(@Inject(MAT_DIALOG_DATA) public data: SimulationResult, private media: ObservableMedia) {
        this.dataSource = data.steps.map((row, index) => {
            (<any>row).position = index;
            return row;
        });
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }

}
