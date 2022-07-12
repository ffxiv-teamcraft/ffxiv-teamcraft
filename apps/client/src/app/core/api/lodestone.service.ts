import { Injectable, NgZone } from '@angular/core';
import { UserService } from '../database/user.service';
import { Character, CharacterResponse, XivapiService } from '@xivapi/angular-client';
import { EMPTY, interval, Observable, of, ReplaySubject, Subject, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IpcService } from '../electron/ipc.service';

@Injectable({ providedIn: 'root' })
export class LodestoneService {

  private static QUEUE: Subject<void>[] = [];

  private static INTERVAL: Subscription;

  private static CACHE: { [index: number]: Observable<Partial<CharacterResponse>> } = {};

  constructor(private userService: UserService, private xivapi: XivapiService,
              private http: HttpClient, private ipc: IpcService, private ngZone: NgZone) {
    if (!LodestoneService.INTERVAL) {
      LodestoneService.INTERVAL = interval(200).subscribe((i) => {
        const subject = LodestoneService.QUEUE.shift();
        if (subject !== undefined) {
          subject.next();
        }
      });
    }
  }

  public searchCharacter(name: string, server: string): Observable<Partial<Character>[]> {
    let dataSource$: Observable<{ List: Partial<Character>[] }>;
    if (this.ipc.ready) {
      const result$ = new ReplaySubject<{ List: Partial<Character>[] }>();
      this.ipc.once('lodestone:character:search', (event, res) => {
        result$.next({ List: res });
      });
      this.ipc.send('lodestone:searchCharacter', { name, server });
      dataSource$ = result$.asObservable();
    } else {
      const params = new HttpParams().set('name', name).set('server', server);
      dataSource$ = this.http.get<any>(`https://lodestone.ffxivteamcraft.com/Character/Search`, { params });
    }
    return dataSource$.pipe(
      map(res => res.List.map(char => {
        return {
          ...char,
          Server: (char as any).World
        };
      }))
    );
  }

  public getCharacterFromLodestoneApi(id: number, columns?: string[]): Observable<Partial<CharacterResponse>> {
    return this.ngZone.runOutsideAngular(() => {
      let dataSource$: Observable<Partial<CharacterResponse>>;
      if (this.ipc.ready) {
        const result$ = new ReplaySubject<Partial<CharacterResponse>>();
        this.ipc.once(`lodestone:character:${id}`, (event, res) => {
          result$.next(res);
          result$.complete();
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
              Server: (res.Character as any).World,
              FreeCompanyId: (res.Character as any).FreeCompany?.ID
            }
          };
        })
      );
    });

  }

  public getCharacter(id: number, cacheCharacter = false): Observable<Partial<CharacterResponse>> {
    if (LodestoneService.CACHE[id] === undefined) {
      const trigger = new Subject<void>();
      LodestoneService.CACHE[id] = trigger.pipe(
        switchMap(() => {
          return this.getCharacterFromLodestoneApi(id).pipe(
            tap(res => {
              if (cacheCharacter) {
                this.cacheCharacter(res as any);
              }
            }),
            startWith(this.getCachedCharacter(id)),
            filter(res => !!res)
          );
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
        shareReplay({ bufferSize: 1, refCount: true })
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
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  private getCachedCharacter(id: number): CharacterResponse | null {
    const data = localStorage.getItem(`character:1:${id}`);
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
    localStorage.setItem(`character:1:${cachedCharacter.ID}`, JSON.stringify({ Character: cachedCharacter }));
  }

  private addToQueue(trigger: Subject<void>): void {
    LodestoneService.QUEUE.push(trigger);
  }
}
