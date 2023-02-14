import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as LazyDataActions from './lazy-data.actions';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LazyDataFacade } from './lazy-data.facade';
import { lazyFilesList } from '@ffxiv-teamcraft/data/lazy-files-list';
import { merge, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformServer } from '@angular/common';
import { PlatformService } from '../../core/tools/platform.service';
import { debounceBufferTime } from '../../core/rxjs/debounce-buffer-time';
import { uniq } from 'lodash';
import { IS_HEADLESS } from '../../../environments/is-headless';
import { uniqMergeMap } from '../../core/rxjs/uniq-merge-map';
import { extractsHash } from '@ffxiv-teamcraft/data/extracts-hash';
import { LazyDataKey } from '@ffxiv-teamcraft/types';

@Injectable()
export class LazyDataEffects {

  private static readonly EXTRACTS_PATH = `/assets/extracts/extracts${environment.production && !environment.beta ? '.' + extractsHash : ''}.json`;

  loadLazyDataEntityEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LazyDataActions.loadLazyDataEntityEntry),
      debounceBufferTime(50),
      map(actions => {
        return actions.reduce((acc, { id, entity }) => {
          return {
            ...acc,
            [entity]: uniq([...(acc[entity] || []), id])
          };
        }, {});
      }),
      mergeMap((registry) => {
        return merge(...Object.entries<number[]>(registry).map(([entity, ids]: [LazyDataKey, number[]]) => {
          if (this.platformService.isDesktop() || !environment.production || environment.beta) {
            return this.getData(this.getUrl(entity)).pipe(
              map(entry => {
                return LazyDataActions.loadLazyDataFullEntitySuccess({ entry, key: entity });
              })
            );
          }
          const { contentName, hash } = this.parseFileName(entity);
          return this.http.get<any>(`https://api.ffxivteamcraft.com/data/${contentName}/${hash}/${ids.join(',')}`).pipe(
            switchMap(res => {
              return ids.map(id => {
                return LazyDataActions.loadLazyDataEntityEntrySuccess({ id, row: res[id] || null, key: entity });
              });
            })
          );
        }));
      })
    ), { useEffectsErrorHandler: true });

  loadLazyDataFullEntity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LazyDataActions.loadLazyDataFullEntity),
      uniqMergeMap(({ entity }) => String(entity), ({ entity }) => {
        return this.getData(this.getUrl(entity)).pipe(
          map(entry => {
            return LazyDataActions.loadLazyDataFullEntitySuccess({ entry, key: entity });
          })
        );
      })
    )
  );

  constructor(private actions$: Actions, private http: HttpClient,
              private facade: LazyDataFacade, private platformService: PlatformService,
              @Inject(PLATFORM_ID) private platform: any) {
  }

  private getUrl(entity: LazyDataKey): string {
    if (entity === 'extracts') {
      return LazyDataEffects.EXTRACTS_PATH;
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
      } else if (environment.beta) {
        url = `https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/apps/client/src${path}`;
      } else {
        url = `https://cdn.ffxivteamcraft.com${path}`;
      }
    }
    return this.http.get<T>(url);
  }
}
