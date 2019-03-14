import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export abstract class TeamcraftComponent implements OnDestroy {
  protected onDestroy$: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }
}
