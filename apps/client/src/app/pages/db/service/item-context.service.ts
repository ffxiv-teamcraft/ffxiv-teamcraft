import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class ItemContextService {
  private readonly itemIdSub$ = new BehaviorSubject<number | undefined>(undefined);
  public readonly itemId$: Observable<number | undefined> = this.itemIdSub$.pipe(distinctUntilChanged());

  public setItemId(id?: number): void {
    console.log(`setItemId:`, id);
    this.itemIdSub$.next(id ?? undefined);
  }
}
