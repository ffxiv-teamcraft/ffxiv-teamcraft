import { Apollo } from 'apollo-angular';
import { Injectable, inject } from '@angular/core';
import { ModificationEntry } from '../../../../modules/list/model/modification-entry';
import { EMPTY, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ListHistoryService {
  private readonly apollo = inject(Apollo);


  getHistory(listId: string): Observable<ModificationEntry[]> {
    return of([]);
  }

  addHistoryEntries(entries: ModificationEntry[]): Observable<void> {
    return EMPTY;
  }

  removeEntry(id: string): Observable<void> {
    return EMPTY;
  }

  removeListEntries(listId: string): Observable<void> {
    return EMPTY;
  }
}
