import { Injectable } from '@angular/core';
import { UserService } from '../database/user.service';
import { Character, XivapiService } from '@xivapi/angular-client';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';

@Injectable()
export class CharacterService {

  private cache: { [index: string]: Observable<Character> } = {};

  constructor(private userService: UserService, private xivapi: XivapiService) {
  }

  public getCharacter(userId: string): Observable<Character> {
    if (this.cache[userId] === undefined) {
      this.cache[userId] = this.userService.get(userId)
        .pipe(
          switchMap(user => this.xivapi.getCharacter(user.defaultLodestoneId)),
          filter(res => res.Info.Character.State === 2),
          map(response => response.Character),
          shareReplay(1)
        );
    }
    return this.cache[userId];
  }
}
