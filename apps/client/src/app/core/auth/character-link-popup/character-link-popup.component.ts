import { Component } from '@angular/core';
import { Character, CharacterSearchResultRow } from '@xivapi/angular-client';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, filter, map, mergeMap, startWith, tap } from 'rxjs/operators';
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AddCharacter, AddCustomCharacter, Logout, VerifyCharacter } from '../../../+state/auth.actions';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { uniq } from 'lodash';
import { LodestoneService } from '../../api/lodestone.service';
import { CHINESE_GAME_SERVERS, GAME_SERVERS, KOREAN_GAME_SERVERS } from '@ffxiv-teamcraft/data/handmade/game-servers';
import { TranslateModule } from '@ngx-translate/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-character-link-popup',
    templateUrl: './character-link-popup.component.html',
    styleUrls: ['./character-link-popup.component.less'],
    standalone: true,
    imports: [NgIf, NzGridModule, NzFormModule, NzInputModule, FormsModule, NzAutocompleteModule, ReactiveFormsModule, NgFor, NzButtonModule, NzWaveModule, NzListModule, NzDividerModule, NzCheckboxModule, NzSpinModule, AsyncPipe, TranslateModule]
})
export class CharacterLinkPopupComponent {

  public servers$: Observable<string[]>;

  public autoCompleteRows$: Observable<string[]>;

  public selectedServer = new UntypedFormControl('', [Validators.required]);

  public characterName = new UntypedFormControl('');

  public lodestoneId = new UntypedFormControl(null);

  public result$: Observable<any[]>;

  public lodestoneIdCharacter$: Observable<Character>;

  public loadingResults = false;

  public useAsDefault = false;

  public mandatory = false;

  public isKoreanOrChinese(server: string): boolean {
    return CHINESE_GAME_SERVERS.includes(server) || KOREAN_GAME_SERVERS.includes(server);
  }

  constructor(private store: Store<any>, private modalRef: NzModalRef,
              private lodestoneService: LodestoneService) {
    this.servers$ = of(GAME_SERVERS).pipe(
      map(servers => {
        return uniq(servers).sort();
      })
    );

    this.autoCompleteRows$ = combineLatest([this.servers$, this.selectedServer.valueChanges])
      .pipe(
        map(([servers, inputValue]) => {
          return servers.filter(server => server.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
        })
      );

    this.result$ = combineLatest([this.selectedServer.valueChanges, this.characterName.valueChanges])
      .pipe(
        tap(([selectedServer]) => {
          this.loadingResults = !this.isKoreanOrChinese(selectedServer);
        }),
        debounceTime(500),
        mergeMap(([selectedServer, characterName]) => {
          return this.lodestoneService.searchCharacter(characterName, selectedServer);
        }),
        tap(() => this.loadingResults = false),
        startWith([])
      );

    this.lodestoneIdCharacter$ = this.lodestoneId.valueChanges.pipe(
      filter(id => id && id !== ''),
      mergeMap(lodestoneId => {
        return this.lodestoneService.getCharacter(lodestoneId);
      }),
      map(response => response.Character),
      filter(character => character !== null)
    );
  }

  setCustomCharacter(): void {
    const fakeLodestoneId = -1 * Math.floor((Math.random() * 999999999));
    const customCharacter: Partial<Character> = {
      ID: fakeLodestoneId,
      Name: this.characterName.value,
      Server: this.selectedServer.value
    };
    this.store.dispatch(new AddCharacter(fakeLodestoneId, this.useAsDefault));
    this.store.dispatch(new AddCustomCharacter(fakeLodestoneId, customCharacter));
    this.store.dispatch(new VerifyCharacter(fakeLodestoneId));
    this.modalRef.close();
  }

  logOut(): void {
    this.store.dispatch(new Logout());
    this.modalRef.close();
  }

  selectCharacter(character: CharacterSearchResultRow | Character): void {
    this.store.dispatch(new AddCharacter(character.ID, this.useAsDefault));
    this.modalRef.close();
  }

}
