import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TutorialStepEntry } from './tutorial-step-entry';
import { Overlay } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  private steps: TutorialStepEntry[] = [];

  constructor(private router: Router) {
    router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.reset();
    });
  }

  public register(step: TutorialStepEntry): void {
    this.steps.push(step);
  }

  public play(): void {
    console.log('START', this.steps);
    this.steps = this.steps.sort((a, b) => a.index - b.index);
    this.nextStep();
  }

  public nextStep(): void {
    const step = this.steps.shift();
    console.log('Step', step);
    if (step) {
      step.play().subscribe(() => {
        this.nextStep();
      });
    }
  }

  public reset(): void {
    this.steps = [];
  }
}
