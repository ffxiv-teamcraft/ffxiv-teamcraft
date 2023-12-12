import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-tutorial-step',
    templateUrl: './tutorial-step.component.html',
    styleUrls: ['./tutorial-step.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NzButtonModule, NzWaveModule, TranslateModule]
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
