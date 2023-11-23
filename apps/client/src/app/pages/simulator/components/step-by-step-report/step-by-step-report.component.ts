import { Component } from '@angular/core';
import { ActionResult } from '@ffxiv-teamcraft/simulator';
import { CraftingActionPipe } from '../../../../pipes/pipes/crafting-action.pipe';
import { IfMobilePipe } from '../../../../pipes/pipes/if-mobile.pipe';
import { ActionComponent } from '../action/action.component';
import { NgIf, NgFor } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
    selector: 'app-step-by-step-report',
    templateUrl: './step-by-step-report.component.html',
    styleUrls: ['./step-by-step-report.component.less'],
    standalone: true,
    imports: [NzTableModule, NgIf, NgFor, ActionComponent, IfMobilePipe, CraftingActionPipe]
})
export class StepByStepReportComponent {

  steps: ActionResult[] = [];
}
