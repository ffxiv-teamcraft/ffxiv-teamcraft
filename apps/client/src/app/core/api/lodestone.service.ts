import { Injectable, NgZone } from '@angular/core';
import { UserService } from '../database/user.service';
import { Character, CharacterResponse } from '@xivapi/angular-client';
import { EMPTY, interval, Observable, of, ReplaySubject, Subject, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IpcService } from '../electron/ipc.service';
import { FreeCompany } from '@xivapi/nodestone';
import { isEmpty } from 'lodash';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LodestoneService {

  private static QUEUE: Subject<void>[] = [];

  private static INTERVAL: Subscription;

  private static CACHE: { [index: number]: Observable<Partial<CharacterResponse>> } = {};

  constructor(private userService: UserService, private http: HttpClient,
              private ipc: IpcService, private ngZone: NgZone, private notification: NzNotificationService,
              private translate: TranslateService) {
    if (!LodestoneService.INTERVAL) {
      LodestoneService.INTERVAL = interval(200).subscribe(() => {
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

  public searchFreeCompany(name: string, server: string): Observable<{ List: FreeCompany[] }> {
    const params = new HttpParams().set('name', name).set('server', server);
    return this.http.get<{ List: FreeCompany[] }>(`https://lodestone.ffxivteamcraft.com/FreeCompany/Search`, { params }).pipe(
      map(results => {
        return {
          ...results,
          List: results.List.map((row: any) => {
            row.avatar = [row.CrestLayers.Bottom, row.CrestLayers.MIDdle, row.CrestLayers.Top];
            return row;
          })
        };
      })
    );
  }

  public getCharacterFromLodestoneApi(id: number, columns?: string[]): Observable<Partial<CharacterResponse>> {
    return this.ngZone.runOutsideAngular(() => {
      let params = new HttpParams();
      if (columns) {
        params = params.set('columns', columns.join(','));
      }
      const dataSource$: Observable<Partial<CharacterResponse>> = this.http.get<any>(`https://lodestone.ffxivteamcraft.com/Character/${id}`, { params });
      return dataSource$.pipe(
        map(res => {
          if (isEmpty(res)) {
            this.notification.error(this.translate.instant("Private_lodestone"), this.translate.instant("Private_lodestone_explain"))
          }
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

  public getFreeCompanyFromLodestoneApi(id: string): Observable<Partial<FreeCompany>> {
    return this.ngZone.runOutsideAngular(() => {
      return this.http.get<FreeCompany>(`https://lodestone.ffxivteamcraft.com/FreeCompany/${id}`).pipe(
        map((row: any) => {
          row.FreeCompany.avatar = [row.FreeCompany.CrestLayers.Bottom, row.FreeCompany.CrestLayers.MIDdle, row.FreeCompany.CrestLayers.Top];
          return row;
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
        switchMap(() => this.getFreeCompanyFromLodestoneApi(id)),
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
          const lodestoneId = user.defaultLodestoneId || user.lodestoneIds[0].id;
          return this.getCharacter(lodestoneId).pipe(
            map(response => ({
              character: response.Character,
              verified: user.lodestoneIds.find(entry => entry.id === lodestoneId)?.verified || false
            }))
          );
        }),
        shareReplay(1)
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
