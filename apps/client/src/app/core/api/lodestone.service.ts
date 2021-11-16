import { Injectable } from '@angular/core';
import { UserService } from '../database/user.service';
import { Character, CharacterResponse, XivapiService } from '@xivapi/angular-client';
import { EMPTY, interval, Observable, of, ReplaySubject, Subject, Subscription } from 'rxjs';
import { filter, map, shareReplay, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IpcService } from '../electron/ipc.service';

@Injectable({ providedIn: 'root' })
export class LodestoneService {

  private static QUEUE: Subject<void>[] = [];

  private static INTERVAL: Subscription;

  private static CACHE: { [index: number]: Observable<Partial<CharacterResponse>> } = {};

  constructor(private userService: UserService, private xivapi: XivapiService,
              private http: HttpClient, private ipc: IpcService) {
    if (!LodestoneService.INTERVAL) {
      LodestoneService.INTERVAL = interval(1000).subscribe((i) => {
        const subject = LodestoneService.QUEUE.shift();
        if (subject !== undefined) {
          subject.next();
        }
      });
    }
  }

  public searchCharacter(name: string, server: string): Observable<Partial<Character>[]> {
    let dataSource$: Observable<Partial<Character>[]>;
    if (this.ipc.ready) {
      const result$ = new ReplaySubject<Partial<Character>[]>();
      this.ipc.once('lodestone:character:search', (event, res) => {
        result$.next(res.map(char => {
          return {
            ...char,
            Server: char.World
          };
        }));
      });
      this.ipc.send('lodestone:searchCharacter', { name, server });
      dataSource$ = result$.asObservable();
    } else {
      const params = new HttpParams().set('name', name).set('server', server);
      dataSource$ = this.http.get<any>(`https://lodestone.ffxivteamcraft.com/Character/Search`, { params });
    }
    return dataSource$.pipe(
      map(res => res.map(char => {
        return {
          ...char,
          Server: (char as any).World
        };
      }))
    );
  }

  public getCharacterFromLodestoneApi(id: number, columns?: string[]): Observable<Partial<CharacterResponse>> {
    let dataSource$: Observable<Partial<CharacterResponse>>;
    if (this.ipc.ready) {
      const result$ = new ReplaySubject<Partial<CharacterResponse>>();
      this.ipc.once('lodestone:character', (event, res) => {
        result$.next(res);
      });
      this.ipc.send('lodestone:getCharacter', id);
      dataSource$ = result$.asObservable();
    } else {
      let params = new HttpParams();
      if (columns) {
        params = params.set('columns', columns.join(','));
      }
      dataSource$ = this.http.get<any>(`https://lodestone.ffxivteamcraft.com/Character/${id}`, { params });
    }
    return dataSource$.pipe(
      map(res => {
        return {
          ...res,
          Character: {
            ...res.Character,
            Server: (res.Character as any).World
          }
        };
      })
    );
  }

  public getCharacter(id: number, noCache = false): Observable<Partial<CharacterResponse>> {
    if (LodestoneService.CACHE[id] === undefined) {
      const trigger = new Subject<void>();
      LodestoneService.CACHE[id] = trigger.pipe(
        switchMap(() => {
          if (noCache || !this.getCachedCharacter(id)) {
            return this.getCharacterFromLodestoneApi(id).pipe(
              tap(res => this.cacheCharacter(res))
            );
          } else {
            return of(this.getCachedCharacter(id));
          }
        }),
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

  private getCachedCharacter(id: number): CharacterResponse | null {
    const data = localStorage.getItem(`character:${id}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  private cacheCharacter(data: Partial<CharacterResponse>): void {
    const cachedCharacter: Partial<Character> & { DC: string } = {
      ID: data.Character.ID,
      Avatar: data.Character.Avatar,
      FreeCompanyId: data.Character.FreeCompanyId,
      Name: data.Character.Name,
      Server: data.Character.Server,
      DC: (data.Character as any).DC,
      Portrait: data.Character.Portrait,
      Bio: data.Character.Bio
    };
    localStorage.setItem(`character:${cachedCharacter.ID}`, JSON.stringify({ Character: cachedCharacter }));
  }

  private addToQueue(trigger: Subject<void>): void {
    LodestoneService.QUEUE.push(trigger);
  }
}
