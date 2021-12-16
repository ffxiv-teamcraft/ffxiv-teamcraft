import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { RotationsState } from './rotations.reducer';
import { rotationsQuery } from './rotations.selectors';
import {
  CreateRotation,
  DeleteRotation,
  GetRotation,
  LoadMyRotations,
  RotationPersisted,
  RotationsActionTypes,
  SelectRotation,
  UpdateRotation
} from './rotations.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { Actions, ofType } from '@ngrx/effects';
import { DefaultConsumables } from '../../../model/user/default-consumables';

@Injectable()
export class RotationsFacade {
  loading$ = this.store.select(rotationsQuery.getLoading);

  allRotations$ = this.store.select(rotationsQuery.getAllRotations);

  myRotations$ = combineLatest([this.allRotations$, this.authFacade.userId$]).pipe(
    map(([rotations, userId]) => rotations.filter(r => r.authorId === userId)),
    map(rotations => rotations.sort((a, b) => a.index - b.index))
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
    this.authFacade.user$.pipe(
      map(user => user.defaultConsumables || <DefaultConsumables>{}),
      first()
    ).subscribe(consumables => {
      const rotation = new CraftingRotation();
      rotation.food = consumables.food;
      rotation.medicine = consumables.medicine;
      rotation.freeCompanyActions = consumables.fcBuffs;
      this.store.dispatch(new CreateRotation(rotation));
    });
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
