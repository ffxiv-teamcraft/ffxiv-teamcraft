import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class ItemContextService {
  private readonly itemIdSub$ = new BehaviorSubject<number | undefined>(undefined);
  /** An observable describing the currently active item id. */
  public readonly itemId$: Observable<number | undefined> = this.itemIdSub$.pipe(distinctUntilChanged());

  /** Sets the currently active item id. */
  public setItemId(id?: number): void {
    this.itemIdSub$.next(id ?? undefined);
  }
}
