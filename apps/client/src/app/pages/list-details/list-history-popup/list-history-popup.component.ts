import { Component, OnInit } from '@angular/core';
import { List } from '../../../modules/list/model/list';
import { Character, XivapiService } from '@xivapi/angular-client';
import { Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { ModificationEntry } from '../../../modules/list/model/modification-entry';

@Component({
  selector: 'app-list-history-popup',
  templateUrl: './list-history-popup.component.html',
  styleUrls: ['./list-history-popup.component.less']
})
export class ListHistoryPopupComponent implements OnInit {

  public list: List;

  public history: ModificationEntry[] = [];

  public characters: { [index: number]: Observable<Character> } = {};

  constructor(private xivapi: XivapiService) {
  }

  ngOnInit() {
    this.history = this.list.modificationsHistory.sort((a, b) => a.date > b.date ? -1 : 1);
    this.history.forEach(entry => {
      if (this.characters[entry.characterId] === undefined) {
        this.characters[entry.characterId] = this.xivapi.getCharacter(entry.characterId).pipe(
          shareReplay(1),
          filter(response => response.Info.Character.State !== 0),
          map(response => response.Character)
        );
      }
    });
  }

}
