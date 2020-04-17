import { Injectable } from '@angular/core';
import { TutorialStepEntry } from './tutorial-step-entry';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  private steps: TutorialStepEntry[] = [];

  private play$ = new Subject<void>();

  private get stepsDone(): string[] {
    return JSON.parse(localStorage.getItem('tutorial') || '[]');
  }

  private set stepsDone(steps: string[]) {
    localStorage.setItem('tutorial', JSON.stringify(steps));
  }

  constructor() {
    this.play$.pipe(
      debounceTime(3000)
    ).subscribe(() => {
      this.play();
    });
  }

  public register(step: TutorialStepEntry): void {
    if (!this.steps.some(s => s.key === step.key)) {
      this.steps.push(step);
      this.play$.next();
    }
  }

  public unregister(key: string): void {
    this.steps = this.steps.filter(step => {
      return step.key !== key;
    });
  }

  public play(): void {
    const done = this.stepsDone;
    this.steps = this.steps
      .filter(step => done.indexOf(step.key) === -1)
      .sort((a, b) => a.index - b.index);
    this.nextStep();
  }

  public nextStep(index = 0): void {
    const step = this.steps[index];
    if (step) {
      step.play(index + 1, this.steps.length).subscribe(() => {
        this.stepsDone = [
          ...this.stepsDone,
          step.key
        ];
        this.nextStep(index + 1);
      });
    } else {
      this.reset();
    }
  }

  public reset(): void {
    this.steps = [];
  }
}
