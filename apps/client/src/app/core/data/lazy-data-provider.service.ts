import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from 'apps/client/src/environments/environment';
import { Observable } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { PlatformService } from '../tools/platform.service';
import { LazyData, LazyDataKey } from './lazy-data';
import { lazyFilesList } from './lazy-files-list';

/**
 * A service providing cached observables that resolve lazy data.
 */
@Injectable({ providedIn: 'root' })
export class LazyDataProviderService {
  private readonly lazyLoaderCache = new Map<LazyDataKey, Observable<LazyData[LazyDataKey]>>();

  constructor(private readonly http: HttpClient, private readonly platformService: PlatformService, @Inject(PLATFORM_ID) private readonly platform: Object) {
  }

  /**
   * Gets an observable that will resolve lazy data for the specified key.
   * For each key, only a single `ReplaySubject`-like observable will ever be created.
   * This ensures that each key will only ever be loaded once, but that loading will be
   * defered until the observable is actually subscribed to.
   *
   * @param key The key of the lazy data to retrieve.
   * @param id The id of the element to retrieve inside the lazy data entry, if not specified, the entire file is fetched.
   * @returns An observable that will emit the lazy data associated with the specified key, then completes.
   */
  public getLazyData<T extends LazyDataKey>(key: T, id?: number | string): Observable<LazyData[T]> {
    if (this.lazyLoaderCache.has(key)) return this.lazyLoaderCache.get(key);
    const entry = lazyFilesList[key];
    const filename = `/assets/data/${environment.production ? entry.hashedFileName : entry.fileName}`;
    const url = this.getUrl(filename);
    const data = this.http.get(url).pipe(take(1), shareReplay(1));
    this.lazyLoaderCache.set(key, data);
    return data;
  }

  private readonly getUrl = (path: string): string => {
    if (this.platformService.isDesktop() || !environment.production || isPlatformServer(this.platform)) {
      return `.${path}`;
    } else {
      return `https://cdn.ffxivteamcraft.com${path}`;
    }
  };
}
