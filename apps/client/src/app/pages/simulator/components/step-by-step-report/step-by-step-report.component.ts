import { Component } from '@angular/core';
import { ActionResult } from '../../model/action-result';

@Component({
  selector: 'app-step-by-step-report',
  templateUrl: './step-by-step-report.component.html',
  styleUrls: ['./step-by-step-report.component.less']
})
export class StepByStepReportComponent {

  steps: ActionResult[] = [];
}
