import { Component } from '@angular/core';
import { ActionResult } from '@ffxiv-teamcraft/simulator';

@Component({
  selector: 'app-step-by-step-report',
  templateUrl: './step-by-step-report.component.html',
  styleUrls: ['./step-by-step-report.component.less']
})
export class StepByStepReportComponent {

  steps: ActionResult[] = [];
}
