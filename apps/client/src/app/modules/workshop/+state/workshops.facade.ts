import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WorkshopsState } from './workshops.reducer';
import { workshopsQuery } from './workshops.selectors';
import {
  CreateWorkshop,
  DeleteWorkshop,
  LoadMyWorkshops,
  LoadWorkshop,
  RemoveListFromWorkshop,
  SelectWorkshop,
  UpdateWorkshop
} from './workshops.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Workshop } from '../../../model/other/workshop';

@Injectable()
export class WorkshopsFacade {
  loaded$ = this.store.select(workshopsQuery.getLoaded);
  allWorkshops$ = this.store.select(workshopsQuery.getAllWorkshops);
  selectedWorkshop$ = this.store.select(workshopsQuery.getSelectedWorkshop);

  myWorkshops$ = combineLatest(this.store.select(workshopsQuery.getAllWorkshops), this.authFacade.userId$)
    .pipe(
      map(([workshops, userId]) => workshops.filter(w => w.authorId === userId)),
      shareReplay(1)
    );
  // TODO
  workshopsWithWriteAccess$ = combineLatest(this.store.select(workshopsQuery.getAllWorkshops), this.authFacade.userId$)
    .pipe(
      map(([workshops, userId]) => workshops.filter(w => w.authorId === userId)),
      shareReplay(1)
    );

  constructor(private store: Store<{ workshops: WorkshopsState }>, private authFacade: AuthFacade) {
  }

  removeListFromWorkshop(listKey: string, workshopKey: string): void {
    this.store.dispatch(new RemoveListFromWorkshop(listKey, workshopKey));
  }

  createWorkshop(workshop: Workshop): void {
    this.store.dispatch(new CreateWorkshop(workshop));
  }

  updateWorkshop(workshop: Workshop): void {
    this.store.dispatch(new UpdateWorkshop(workshop));
  }

  loadWorkshop(key: string): void {
    this.store.dispatch(new LoadWorkshop(key));
  }

  selectWorkshop(key: string): void {
    this.store.dispatch(new SelectWorkshop(key));
  }

  deleteWorkshop(key: string): void {
    this.store.dispatch(new DeleteWorkshop(key));
  }

  loadMyWorkshops(): void {
    this.store.dispatch(new LoadMyWorkshops());
  }
}
