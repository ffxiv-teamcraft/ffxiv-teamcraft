import { Injectable } from '@angular/core';
import { UserService } from '../database/user.service';
import { Character, XivapiService } from '@xivapi/angular-client';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class CharacterService {

  private cache: { [index: string]: Observable<{ character: Character, verified: boolean }> } = {};

  constructor(private userService: UserService, private xivapi: XivapiService) {
  }

  public getCharacter(userId: string): Observable<{ character: Character, verified: boolean }> {
    if (this.cache[userId] === undefined) {
      const reloader = new BehaviorSubject<void>(null);
      this.cache[userId] = reloader.pipe(
        switchMap(() => {
          return this.userService.get(userId)
            .pipe(
              switchMap(user => {
                // LodestoneId < 0 means custom character
                if (user.defaultLodestoneId < 0) {
                  return of(user.customCharacters.find(c => c.ID === user.defaultLodestoneId)).pipe(
                    map(character => {
                      return {
                        character: <Character>character,
                        verified: true
                      };
                    })
                  );
                }
                return this.xivapi.getCharacter(user.defaultLodestoneId).pipe(
                  tap(res => {
                    // If state is 1, then try again in 2 minutes
                    if (res.Info.Character.State === 1) {
                      setTimeout(() => {
                        reloader.next(null);
                      }, 120000);
                    }
                  }),
                  filter(res => res.Info.Character.State === 2),
                  map(response => ({
                    character: response.Character,
                    verified: user.lodestoneIds.find(entry => entry.id === user.defaultLodestoneId).verified
                  }))
                );
              })
            );
        }),
        shareReplay(1)
      );
    }
    return this.cache[userId];
  }
}
