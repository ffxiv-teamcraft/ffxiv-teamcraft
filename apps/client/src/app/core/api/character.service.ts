import { Injectable } from '@angular/core';
import { UserService } from '../database/user.service';
import { Character, XivapiService } from '@xivapi/angular-client';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';

@Injectable()
export class CharacterService {

  private cache: { [index: string]: Observable<{ character: Character, verified: boolean }> } = {};

  constructor(private userService: UserService, private xivapi: XivapiService) {
  }

  public getCharacter(userId: string): Observable<{ character: Character, verified: boolean }> {
    if (this.cache[userId] === undefined) {
      this.cache[userId] = this.userService.get(userId)
        .pipe(
          switchMap(user => this.xivapi.getCharacter(user.defaultLodestoneId).pipe(
            filter(res => res.Info.Character.State === 2),
            map(response => ({
              character: response.Character,
              verified: user.lodestoneIds.find(entry => entry.id === user.defaultLodestoneId).verified
            }))
          )),
          shareReplay(1)
        );
    }
    return this.cache[userId];
  }
}
