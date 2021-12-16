import { Injectable } from '@angular/core';
import { TutorialStepEntry } from './tutorial-step-entry';
import { Subject } from 'rxjs';
import { debounceTime, first, skipUntil } from 'rxjs/operators';
import { SettingsService } from '../../modules/settings/settings.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TutorialPopupComponent } from './tutorial-popup/tutorial-popup.component';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  private steps: TutorialStepEntry[] = [];

  private play$ = new Subject<void>();

  private applicationReady$ = new Subject<void>();

  private isPlaying = false;

  constructor(private settings: SettingsService, private modal: NzModalService,
              private translate: TranslateService) {
    this.play$.pipe(
      skipUntil(this.applicationReady$),
      debounceTime(1000)
    ).subscribe(() => {
      this.play();
    });
  }

  private get stepsDone(): string[] {
    return JSON.parse(localStorage.getItem('tutorial') || '[]');
  }

  private set stepsDone(steps: string[]) {
    localStorage.setItem('tutorial', JSON.stringify(steps));
  }

  public register(step: TutorialStepEntry): boolean {
    if (!this.steps.some(s => s.key === step.key)) {
      this.steps.push(step);
      this.play$.next();
      return true;
    }
    return false;
  }

  public unregister(key: string): void {
    this.steps = this.steps.filter(step => {
      return step.key !== key;
    });
  }

  public play(force = false): void {
    // Want to force it? okay let's start tutorial and stop the logic here.
    if (force) {
      this.startTutorial(true);
      return;
    }
    if (!this.settings.tutorialQuestionAsked) {
      this.settings.tutorialQuestionAsked = true;
      this.translate.get('TUTORIAL.POPUP.Title').pipe(
        first()
      ).subscribe(title => {
        this.modal.create({
          nzTitle: title,
          nzContent: TutorialPopupComponent,
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        }).afterClose
          .subscribe(res => {
            this.settings.tutorialEnabled = res;
            if (res) {
              this.startTutorial(false);
            }
          });
      });
    } else if (this.settings.tutorialEnabled) {
      this.startTutorial(false);
    }
  }

  public nextStep(steps: TutorialStepEntry[], index = 0): void {
    const step = steps[index];
    if (step) {
      step.play(index + 1, steps.length).subscribe(() => {
        this.stepsDone = [
          ...this.stepsDone,
          step.key
        ];
        this.nextStep(steps, index + 1);
      });
    } else {
      this.isPlaying = false;
      document.body.scrollTop = 0;
    }
  }

  public reset(): void {
    this.steps = [];
  }

  public applicationReady(): void {
    this.applicationReady$.next();
    this.applicationReady$.complete();
  }

  private startTutorial(force: boolean): void {
    if (this.isPlaying) {
      return;
    }
    this.isPlaying = true;
    this.steps = this.steps
      .sort((a, b) => a.index - b.index);
    if (force) {
      this.nextStep(this.steps);
    } else {
      const done = this.stepsDone;
      this.nextStep(this.steps.filter(step => done.indexOf(step.key) === -1));
    }
  }
}
