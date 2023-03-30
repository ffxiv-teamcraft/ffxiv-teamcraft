import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { ModificationEntry } from '../../../../modules/list/model/modification-entry';
import { Observable } from 'rxjs';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ListHistoryService {
  constructor(private readonly apollo: Apollo) {
  }

  getHistory(listId: string): Observable<ModificationEntry[]> {
    const query = gql`subscription listHistory($listId: String!) {
      list_history(where:{listId: {_eq: $listId}}) {
        id,
        userId,
        amount,
        itemId,
        date,
        finalItem,
        total,
        recipeId
      }
    }`;
    return this.apollo.subscribe<{ list_history: ModificationEntry[] }>({
      query,
      variables: { listId }
    }).pipe(
      map(res => res.data.list_history)
    );
  }

  addHistoryEntries(entries: ModificationEntry[]): Observable<void> {
    const mutation = gql`mutation addListHistoryEntries($entries: [list_history_insert_input!]!) {
      insert_list_history(objects: $entries){
        affected_rows
      }
    }`;
    return this.apollo.mutate({
      mutation,
      variables: { entries }
    }).pipe(
      map(() => void 0)
    );
  }

  removeEntry(id: string): Observable<void> {
    const mutation = gql`mutation removeEntry($id: uuid!) {
      delete_list_history(where: {id: {_eq: $id}}){
        affected_rows
      }
    }`;
    return this.apollo.mutate({
      mutation,
      variables: { id }
    }).pipe(
      map(() => void 0)
    );
  }

  removeListEntries(listId: string): Observable<void> {
    const mutation = gql`mutation removeListEntries($listId: String!) {
      delete_list_history(where: {listId: {_eq: $listId}}){
        affected_rows
      }
    }`;
    return this.apollo.mutate({
      mutation,
      variables: { listId }
    }).pipe(
      map(() => void 0)
    );
  }
}
