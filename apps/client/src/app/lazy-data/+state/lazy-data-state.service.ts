import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { getExtract, LazyDataEntries, LazyDataKey, LazyDataRecordKey, LazyDataWithExtracts } from '@ffxiv-teamcraft/types';
import { LazyDataLoadingState } from './lazy-data-loading-state';
import { lazyFilesList } from '@ffxiv-teamcraft/data/lazy-files-list';
import { environment } from '../../../environments/environment';
import { extractsHash } from '@ffxiv-teamcraft/data/extracts-hash';
import { BehaviorSubject, defer, first, map, Observable, of, Subject, Subscription } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { IS_HEADLESS } from '../../../environments/is-headless';
import { HttpClient } from '@angular/common/http';
import { PlatformService } from '../../core/tools/platform.service';
import { distinctUntilChanged, filter, mergeMap, shareReplay, skipUntil, tap } from 'rxjs/operators';
import { debounceBufferTime } from '../../core/rxjs/debounce-buffer-time';

@Injectable({ providedIn: 'root' })
export class LazyDataStateService {

  private static readonly EXTRACTS_PATH = `/assets/extracts/extracts${environment.production && !environment.beta ? '.' + extractsHash : ''}.json`;

  private loadingStates: Partial<{ [Key in LazyDataKey]: LazyDataLoadingState }> = {};

  private data: Partial<{ [Key in LazyDataKey]: BehaviorSubject<Partial<LazyDataWithExtracts[Key]>> }> = {};

  private partialLoadQueue: Partial<{ [Key in LazyDataKey]: Subject<keyof LazyDataWithExtracts[Key]> }> = {};

  private partialLoadSubscriptions: Partial<{ [Key in LazyDataKey]: Subscription }> = {};

  private loadingKeys$ = new BehaviorSubject<string[]>([]);

  public readonly loading$ = this.loadingKeys$.pipe(
    map(keys => keys.length > 0),
    distinctUntilChanged(),
    shareReplay(1)
  );

  constructor(private http: HttpClient, private platformService: PlatformService,
              @Inject(PLATFORM_ID) private platform: any) {
  }

  public getEntry<K extends LazyDataKey>(propertyKey: K): Observable<LazyDataWithExtracts[K]> {
    // Using defer here to only trigger on subscribe to avoid hot calls from being made
    return defer(() => {
      const loadingState = this.loadingStates[propertyKey];
      const data$ = this.getDataObservable(propertyKey);
      const lock$ = new Subject<void>();
      const shouldLoad = !loadingState || loadingState.status !== 'full';
      if (shouldLoad) {
        this.loadingStates[propertyKey] = {
          status: 'full',
          loading: true
        };
        this.loadingKeys$.next([...this.loadingKeys$.value, `${propertyKey}:full`]);
        this.getData(this.getUrl(propertyKey))
          .subscribe((data: LazyDataWithExtracts[K]) => {
            this.loadingStates[propertyKey] = {
              status: 'full'
            };
            lock$.next();
            data$.next(data);
            this.loadingKeys$.next(this.loadingKeys$.value.filter(v => !v.startsWith(propertyKey)));
          });
      }
      return (data$ as BehaviorSubject<LazyDataWithExtracts[K]>).asObservable().pipe(
        filter(Boolean),
        skipUntil(shouldLoad ? lock$ : of(true))
      );
    });
  }

  public preloadEntry(propertyKey: LazyDataKey): void {
    this.getEntry(propertyKey).pipe(first()).subscribe();
  }


  public getRow<K extends LazyDataRecordKey>(propertyKey: K, id: string | number | symbol): Observable<LazyDataEntries[K] | null>;
  public getRow<K extends LazyDataRecordKey>(propertyKey: K, id: string | number | symbol, fallback: Partial<LazyDataEntries[K]>): Observable<Partial<LazyDataEntries[K]> | LazyDataEntries[K]>;
  /**
   * Gets a single entry of a given property
   * @param propertyKey the name of the property to get the id from
   * @param id the id of the row you want to load
   * @param fallback fallback value if nothing is found
   */
  public getRow<K extends LazyDataRecordKey>(propertyKey: K, id: string | number | symbol, fallback: Partial<LazyDataEntries[K]> = null): Observable<LazyDataEntries[K] | null> | Observable<Partial<LazyDataEntries[K]> | LazyDataEntries[K]> {
    return defer(() => {
      if (this.platformService.isDesktop()) {
        this.preloadEntry(propertyKey);
      }
      if (propertyKey === 'extracts' && !fallback) {
        fallback = getExtract({}, Number(id)) as any;
      }
      let loadingState = this.loadingStates[propertyKey];
      const data$ = this.getDataObservable(propertyKey);
      // If it's already fully loaded or fully loading, don't do anything and just return partial Observable
      if (loadingState?.status !== 'full') {
        if (!loadingState) {
          loadingState = {
            status: 'partial',
            loaded: [],
            loading: []
          };
          this.loadingStates[propertyKey] = loadingState;
        }
        if (!loadingState.loaded.includes(id) && !loadingState.loading.includes(id)) {
          this.loadingKeys$.next([...this.loadingKeys$.value, `${propertyKey}:${id.toString()}`]);
          loadingState.loading.push(id);
          this.loadRowAndSetupSubscription(propertyKey, id as keyof LazyDataWithExtracts[K]);
        }
      }
      return data$.pipe(
        filter(Boolean),
        map(data => {
          return data[id] || fallback;
        }),
        filter(res => res !== undefined),
        distinctUntilChanged()
      );
    });
  }

  private loadRowAndSetupSubscription<K extends LazyDataRecordKey>(propertyKey: K, id: keyof LazyDataWithExtracts[K]): void {
    if (!this.partialLoadQueue[propertyKey]) {
      this.partialLoadQueue[propertyKey] = new Subject<keyof LazyDataWithExtracts[K]>() as any;
    }
    if (!this.partialLoadSubscriptions[propertyKey]) {
      const { contentName, hash } = this.parseFileName(propertyKey);
      this.partialLoadSubscriptions[propertyKey] = this.partialLoadQueue[propertyKey].pipe(
        // Small 20ms debounce to make sure we catch all demands before starting our request
        debounceBufferTime(20),
        mergeMap((ids) => {
          return this.http.get<any>(`https://api.ffxivteamcraft.com/data/${contentName}/${hash}/${ids.join(',')}`).pipe(
            tap(() => {
              const loadingState = this.loadingStates[propertyKey];
              if (loadingState.status === 'partial') {
                loadingState.loaded.push(...ids);
                loadingState.loading = loadingState.loading.filter(id => !ids.includes(id as any));
                const loadingKeys = this.loadingKeys$.value.filter(v => {
                  return !ids.some(id => v === `${propertyKey}:${id.toString()}`);
                });
                this.loadingKeys$.next(loadingKeys);
              }
            })
          );
        })
      ).subscribe((data: Partial<LazyDataWithExtracts[K]>) => {
        const obs$ = this.getDataObservable(propertyKey);
        obs$.next({
          ...obs$.value,
          ...data
        });
      });
    }
    this.partialLoadQueue[propertyKey].next(id);
  }

  /**
   *  ===================== TOOLING
   */

  private getDataObservable<K extends LazyDataKey>(key: K): BehaviorSubject<Partial<LazyDataWithExtracts[K]>> {
    if (!this.data[key]) {
      // We have to cast because TS is being stupid for some reason here
      this.data[key] = new BehaviorSubject<Partial<LazyDataWithExtracts[K]>>(null) as any;
    }
    return this.data[key];
  }

  private getUrl(entity: LazyDataKey): string {
    if (entity === 'extracts') {
      return LazyDataStateService.EXTRACTS_PATH;
    }
    const row = lazyFilesList[entity];
    return `/assets/data/${environment.production && !environment.beta ? row.hashedFileName : row.fileName}`;
  }

  private parseFileName(entity: LazyDataKey): { hash: string, contentName: string } {
    if (entity === 'extracts') {
      return {
        contentName: entity,
        hash: extractsHash
      };
    }
    const fileName = lazyFilesList[entity]?.hashedFileName;
    const parsed = fileName.split('.');
    return {
      contentName: parsed[0],
      hash: parsed[1]
    };
  }

  private getData<T = any>(path: string): Observable<T> {
    let url: string;
    if (path.startsWith('http')) {
      url = path;
    } else {
      if (this.platformService.isDesktop() || !environment.production || isPlatformServer(this.platform) || IS_HEADLESS) {
        url = `.${path}`;
      } else {
        url = `https://cdn.ffxivteamcraft.com${path}`;
      }
    }
    return this.http.get<T>(url);
  }
}
