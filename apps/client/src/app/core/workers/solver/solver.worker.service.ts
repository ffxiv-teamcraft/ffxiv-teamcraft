import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Craft, CrafterStats, CraftingAction, CraftingActionsRegistry } from '@ffxiv-teamcraft/simulator';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SolverWorkerService {
  private worker: Worker;

  private _result$: Subject<CraftingAction[]> = new Subject<CraftingAction[]>();

  public result$: Observable<CraftingAction[]> = this._result$.asObservable();

  constructor() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./solver.worker', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }) => {
        this._result$.next(CraftingActionsRegistry.deserializeRotation(data));
      };
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  public solveRotation(recipe: Craft, stats: CrafterStats, seed?: CraftingAction[]): Observable<CraftingAction[]> {
    this.worker.postMessage({
      recipe,
      stats,
      seed
    });
    return this.result$.pipe(first());
  }

  public isSupported(): boolean {
    return this.worker !== undefined;
  }
}
