import { Component } from '@angular/core';
import { CharacterSearchResult, CharacterSearchResultRow, XivapiService } from '@xivapi/angular-client';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map, mergeMap, startWith, tap } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AddCharacter } from '../../../+state/auth.actions';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-character-link-popup',
  templateUrl: './character-link-popup.component.html',
  styleUrls: ['./character-link-popup.component.less']
})
export class CharacterLinkPopupComponent {

  public servers$: Observable<string[]>;

  public autoCompleteRows$: Observable<string[]>;

  public selectedServer = new FormControl('', [Validators.required]);

  public characterName = new FormControl('');

  public lodestoneId = new FormControl(null);

  public result$: Observable<CharacterSearchResultRow[]>;

  public loadingResults = false;

  public useAsDefault = true;

  constructor(private xivapi: XivapiService, private store: Store<any>, private modalRef: NzModalRef) {
    this.servers$ = this.xivapi.getServerList();

    this.autoCompleteRows$ = combineLatest(this.servers$, this.selectedServer.valueChanges)
      .pipe(
        map(([servers, inputValue]) => {
          return servers.filter(server => server.indexOf(inputValue) > -1);
        })
      );

    this.result$ = combineLatest(this.selectedServer.valueChanges, this.characterName.valueChanges)
      .pipe(
        tap(() => this.loadingResults = true),
        debounceTime(500),
        mergeMap(([selectedServer, characterName]) => {
          return this.xivapi.searchCharacter(characterName, selectedServer);
        }),
        map((result: CharacterSearchResult) => result.Results || []),
        tap(() => this.loadingResults = false),
        startWith([])
      );
  }

  selectCharacter(character: CharacterSearchResultRow): void {
    this.store.dispatch(new AddCharacter(character.ID, this.useAsDefault));
    this.modalRef.close();
  }

}
