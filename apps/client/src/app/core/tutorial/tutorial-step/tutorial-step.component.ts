import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tutorial-step',
  templateUrl: './tutorial-step.component.html',
  styleUrls: ['./tutorial-step.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorialStepComponent {

  @Input()
  stepKey: string;

  align: string;

  stepIndex: number;

  totalSteps: number;

  done$: Subject<void> = new Subject<void>();

  public next(): void {
    this.done$.next();
  }

}
