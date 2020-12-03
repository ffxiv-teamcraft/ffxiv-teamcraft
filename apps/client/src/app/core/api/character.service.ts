import { Injectable } from '@angular/core';
import { UserService } from '../database/user.service';
import { Character, CharacterResponse, XivapiService } from '@xivapi/angular-client';
import { EMPTY, interval, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap, switchMapTo, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CharacterService {

  private static QUEUE: Subject<void>[] = [];

  private static INTERVAL: Subscription;

  private static CACHE: { [index: number]: Observable<CharacterResponse> } = {};

  constructor(private userService: UserService, private xivapi: XivapiService) {
    if (!CharacterService.INTERVAL) {
      CharacterService.INTERVAL = interval(1500).subscribe((i) => {
        const subject = CharacterService.QUEUE.shift();
        if (subject !== undefined) {
          subject.next();
        }
      });
    }
  }

  private getCachedCharacter(id: number): CharacterResponse | null {
    const data = localStorage.getItem(`character:${id}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  private cacheCharacter(charResponse: CharacterResponse): void {
    localStorage.setItem(`character:${charResponse.Character.ID}`, JSON.stringify(charResponse));
  }

  public getCharacter(id: number): Observable<CharacterResponse> {
    if (CharacterService.CACHE[id] === undefined) {
      const trigger = new Subject<void>();
      CharacterService.CACHE[id] = trigger.pipe(
        switchMapTo(this.xivapi.getCharacter(id)),
        tap(res => this.cacheCharacter(res)),
        startWith(this.getCachedCharacter(id)),
        filter(res => res !== null),
        shareReplay(1)
      );
      this.addToQueue(trigger);
    }
    return CharacterService.CACHE[id];
  }

  public getUserCharacter(userId: string): Observable<{ character: Character, verified: boolean }> {
    if (!userId) {
      return EMPTY;
    }
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
          if (!user.defaultLodestoneId && !user.lodestoneIds[0]) {
            return of(null);
          }
          return this.getCharacter(user.defaultLodestoneId || user.lodestoneIds[0].id).pipe(
            map(response => ({
              character: response.Character,
              verified: user.lodestoneIds.find(entry => entry.id === user.defaultLodestoneId).verified
            }))
          );
        }),
        shareReplay(1)
      );
  }

  private addToQueue(trigger: Subject<void>): void {
    CharacterService.QUEUE.push(trigger);
  }
}
