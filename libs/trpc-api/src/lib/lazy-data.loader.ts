import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { from, Observable, shareReplay } from 'rxjs';
import axios from 'axios';

export class LazyDataLoader {

  public cache: Partial<{ [K in keyof LazyData]: Observable<LazyData[K]> }> = {};

  public get<K extends keyof LazyData>(key: K): Observable<LazyData[K]> {

    return from(axios.get()).pipe(
      shareReplay(1)
    );
  }
}
