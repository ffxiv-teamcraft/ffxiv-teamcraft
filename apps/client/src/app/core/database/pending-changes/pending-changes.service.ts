import { Injectable } from '@angular/core';
import { DirtyFacade } from '../../dirty/+state/dirty.facade';
import { DirtyScope } from '../../dirty/dirty-scope';

@Injectable()
export class PendingChangesService {

  constructor(private dirtyFacade: DirtyFacade) {
  }

  public addPendingChange(id: string): void {
    this.dirtyFacade.addEntry(id, DirtyScope.APP);
  }

  public removePendingChange(id: string): void {
    this.dirtyFacade.removeEntry(id, DirtyScope.APP);
  }
}
