import { Component, inject } from '@angular/core';
import { ActionResult } from '@ffxiv-teamcraft/simulator';
import { CraftingActionPipe } from '../../../../pipes/pipes/crafting-action.pipe';
import { IfMobilePipe } from '../../../../pipes/pipes/if-mobile.pipe';
import { ActionComponent } from '../action/action.component';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-step-by-step-report',
  templateUrl: './step-by-step-report.component.html',
  styleUrls: ['./step-by-step-report.component.less'],
  standalone: true,
  imports: [NzTableModule, ActionComponent, IfMobilePipe, CraftingActionPipe]
})
export class StepByStepReportComponent {

  data = inject(NZ_MODAL_DATA);

  get steps(): ActionResult[] {
    return this.data.steps;
  }
}
