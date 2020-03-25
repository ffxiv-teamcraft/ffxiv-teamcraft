import { Component } from '@angular/core';
import { Character, CharacterSearchResult, CharacterSearchResultRow, XivapiService } from '@xivapi/angular-client';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, map, mergeMap, startWith, tap } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AddCharacter, AddCustomCharacter, Logout } from '../../../+state/auth.actions';
import { NzModalRef } from 'ng-zorro-antd';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';

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

  public lodestoneIdCharacter$: Observable<Character>;

  public loadingResults = false;

  public useAsDefault = false;

  public mandatory = false;

  private koreanServers = ['초코보', '모그리', '카벙클', '톤베리'];

  private chineseServers = [
    // 陆行鸟 (China 1)
    '红玉海', '神意之地', '拉诺西亚', '幻影群岛', '萌芽池', '宇宙和音', '晨曦王座',
    // 莫古力 (China 2)
    '白金幻象', '白银乡', '神拳痕', '潮风亭', '旅人栈桥', '拂晓之间', '龙巢神殿',
    // 猫小胖 (China 3)
    '延夏', '摩杜纳', '紫水栈桥', '静语庄园', '海猫茶屋', '琥珀原'
  ];

  constructor(private xivapi: XivapiService, private store: Store<any>, private modalRef: NzModalRef) {
    this.servers$ = this.xivapi.getServerList().pipe(
      map(servers => {
        return [
          ...servers,
          ...this.koreanServers.map(server => `Korean Server (${server})`),
          ...this.chineseServers.map(server => `Chinese Server (${server})`)
        ].sort();
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
        tap(() => this.loadingResults = true),
        debounceTime(500),
        mergeMap(([selectedServer, characterName]) => {
          return this.xivapi.searchCharacter(characterName, selectedServer);
        }),
        map((result: CharacterSearchResult) => result.Results || []),
        tap(() => this.loadingResults = false),
        startWith([])
      );

    this.lodestoneIdCharacter$ = this.lodestoneId.valueChanges.pipe(
      filter(id => id && id !== ''),
      mergeMap(lodestoneId => {
        return this.xivapi.getCharacter(lodestoneId);
      }),
      map(response => response.Character),
      filter(character => character !== null)
    );
  }

  setKoreanCharacter(): void {
    const fakeLodestoneId = -1 * Math.floor((Math.random() * 999999999));
    const customCharacter = {
      ID: fakeLodestoneId,
      Name: this.characterName.value
    };
    this.store.dispatch(new AddCharacter(fakeLodestoneId, this.useAsDefault));
    this.store.dispatch(new AddCustomCharacter(fakeLodestoneId, customCharacter));
    this.modalRef.close();
  }

  logOut(): void {
    this.store.dispatch(new Logout());
    this.modalRef.close();
  }

  selectCharacter(character: CharacterSearchResultRow): void {
    this.store.dispatch(new AddCharacter(character.ID, this.useAsDefault));
    this.modalRef.close();
  }

}
