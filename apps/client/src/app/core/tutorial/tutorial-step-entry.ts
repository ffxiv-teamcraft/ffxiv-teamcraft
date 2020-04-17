import { Observable } from 'rxjs';

export class TutorialStepEntry {
  constructor(public readonly index: number, public readonly play: () => Observable<void>) {
  }
}
