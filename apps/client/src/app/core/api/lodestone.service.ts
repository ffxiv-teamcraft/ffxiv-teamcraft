import { Injectable } from '@angular/core';
import { UserService } from '../database/user.service';
import { Character, CharacterResponse, XivapiService } from '@xivapi/angular-client';
import { EMPTY, interval, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap, switchMapTo, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LodestoneService {

  private static QUEUE: Subject<void>[] = [];

  private static INTERVAL: Subscription;

  private static CACHE: { [index: number]: Observable<CharacterResponse> } = {};

  constructor(private userService: UserService, private xivapi: XivapiService) {
    if (!LodestoneService.INTERVAL) {
      LodestoneService.INTERVAL = interval(1500).subscribe((i) => {
        const subject = LodestoneService.QUEUE.shift();
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

  private cacheCharacter(data: CharacterResponse, userCharacter = false): void {
    const cachedCharacter: Partial<Character> = {
      ID: data.Character.ID,
      Avatar: data.Character.Avatar,
      FreeCompanyId: data.Character.FreeCompanyId,
      Name: data.Character.Name,
      Server: data.Character.Server,
      Portrait: data.Character.Portrait,
      Bio: data.Character.Bio
    };
    if (userCharacter) {
      cachedCharacter.ClassJobs = data.Character.ClassJobs;
    }
    localStorage.setItem(`character:${cachedCharacter.ID}`, JSON.stringify({ Character: cachedCharacter }));
  }

  public getCharacter(id: number, userCharacter = false): Observable<CharacterResponse> {
    if (LodestoneService.CACHE[id] === undefined) {
      const trigger = new Subject<void>();
      LodestoneService.CACHE[id] = trigger.pipe(
        switchMapTo(this.xivapi.getCharacter(id, { columns: ['Character'] })),
        tap(res => this.cacheCharacter(res, userCharacter)),
        startWith(this.getCachedCharacter(id)),
        filter(res => res !== null),
        shareReplay(1)
      );
      this.addToQueue(trigger);
    }
    return LodestoneService.CACHE[id];
  }

  public getFreeCompany(id: string): Observable<any> {
    if (LodestoneService.CACHE[id] === undefined) {
      const trigger = new Subject<void>();
      LodestoneService.CACHE[id] = trigger.pipe(
        switchMapTo(this.xivapi.getFreeCompany(id)),
        shareReplay(1)
      );
      this.addToQueue(trigger);
    }
    return LodestoneService.CACHE[id];
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
    LodestoneService.QUEUE.push(trigger);
  }
}
