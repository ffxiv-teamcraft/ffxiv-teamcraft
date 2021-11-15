import { Component } from '@angular/core';
import { Character, CharacterSearchResult, CharacterSearchResultRow, XivapiService } from '@xivapi/angular-client';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, map, mergeMap, startWith, tap } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AddCharacter, AddCustomCharacter, Logout } from '../../../+state/auth.actions';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { uniq } from 'lodash';
import { LodestoneService } from '../../api/lodestone.service';

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

  public result$: Observable<any[]>;

  public lodestoneIdCharacter$: Observable<Character>;

  public loadingResults = false;

  public useAsDefault = false;

  public mandatory = false;
  public chineseServers = [
    'HongYuHai',
    'ShenYiZhiDi',
    'LaNuoXiYa',
    'HuanYingQunDao',
    'MengYaChi',
    'YuZhouHeYin',
    'WoXianXiRan',
    'ChenXiWangZuo',
    'ZiShuiZhanQiao',
    'YanXia',
    'JingYuZhuangYuan',
    'MoDuNa',
    'HaiMaoChaWu',
    'RouFengHaiWan',
    'HuPoYuan',
    'HongYuHai',
    'ShenYiZhiDi',
    'LaNuoXiYa',
    'HuanYingQunDao',
    'MengYaChi',
    'YuZhouHeYin',
    'WoXianXiRan',
    'ChenXiWangZuo',
    'BaiYinXiang',
    'BaiJinHuanXiang',
    'ShenQuanHen',
    'ChaoFengTing',
    'LvRenZhanQiao',
    'FuXiaoZhiJian',
    'Longchaoshendian',
    'MengYuBaoJing',
    'ZiShuiZhanQiao',
    'YanXia',
    'JingYuZhuangYuan',
    'MoDuNa',
    'HaiMaoChaWu',
    'RouFengHaiWan',
    'HuPoYuan'
  ];
  private koreanServers = ['초코보', '모그리', '카벙클', '톤베리', '펜리르'];

  constructor(private xivapi: XivapiService, private store: Store<any>, private modalRef: NzModalRef,
              private lodestoneService: LodestoneService) {
    this.servers$ = this.xivapi.getServerList().pipe(
      map(servers => {
        return [
          ...uniq(servers),
          ...this.koreanServers.map(server => `Korean Server (${server})`)
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

  setKoreanCharacter(): void {
    const fakeLodestoneId = -1 * Math.floor((Math.random() * 999999999));
    const customCharacter: Partial<Character> = {
      ID: fakeLodestoneId,
      Name: this.characterName.value,
      Server: this.selectedServer.value
    };
    this.store.dispatch(new AddCharacter(fakeLodestoneId, this.useAsDefault));
    this.store.dispatch(new AddCustomCharacter(fakeLodestoneId, customCharacter));
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
