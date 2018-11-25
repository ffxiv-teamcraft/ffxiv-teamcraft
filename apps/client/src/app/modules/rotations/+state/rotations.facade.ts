import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { RotationsState } from './rotations.reducer';
import { rotationsQuery } from './rotations.selectors';
import {
  DeleteRotation,
  GetRotation,
  LoadMyRotations,
  UpdateRotation,
  SelectRotation,
  CreateRotation,
  RotationsActionTypes, RotationPersisted
} from './rotations.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { Actions, ofType } from '@ngrx/effects';

@Injectable()
export class RotationsFacade {
  loading$ = this.store.select(rotationsQuery.getLoading);
  allRotations$ = this.store.select(rotationsQuery.getAllRotations);
  myRotations$ = combineLatest(this.allRotations$, this.authFacade.userId$).pipe(
    map(([rotations, userId]) => rotations.filter(r => r.authorId === userId))
  );
  selectedRotation$ = this.store.select(rotationsQuery.getSelectedRotation).pipe(
    filter(r => r !== undefined && r !== null)
  );

  rotationCreated$: Observable<string> = this.actions$.pipe(
    ofType<RotationPersisted>(RotationsActionTypes.RotationPersisted),
    map(action => action.key)
  );

  constructor(private store: Store<{ rotations: RotationsState }>,
              private authFacade: AuthFacade, private actions$: Actions) {
  }

  createRotation(): void {
    this.store.dispatch(new CreateRotation(new CraftingRotation()));
  }

  updateRotation(rotation: CraftingRotation): void {
    this.store.dispatch(new UpdateRotation(rotation));
  }

  getRotation(key: string): void {
    this.store.dispatch(new GetRotation(key));
  }

  selectRotation(key: string): void {
    this.store.dispatch(new SelectRotation(key));
  }

  deleteRotation(key: string): void {
    this.store.dispatch(new DeleteRotation(key));
  }

  loadMyRotations() {
    this.store.dispatch(new LoadMyRotations());
  }
}
