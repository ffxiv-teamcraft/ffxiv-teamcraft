import { Component, OnInit } from '@angular/core';
import { requestsWithDelay } from '../../../core/rxjs/requests-with-delay';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { HttpClient } from '@angular/common/http';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { ItemData } from '../../../model/garland-tools/item-data';
import { saveAs } from 'file-saver';
import { DataExtractorService } from '../../../modules/list/data/data-extractor.service';
import * as _ from 'lodash';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';

@Component({
  selector: 'app-extractor',
  templateUrl: './extractor.component.html',
  styleUrls: ['./extractor.component.less']
})
export class ExtractorComponent implements OnInit {

  public done$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public totalTodo$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public progress$: Observable<number> = combineLatest([this.done$, this.totalTodo$]).pipe(
    filter(([, todo]) => todo > 0),
    map(([done, todo]) => {
      return Math.round(done * 100 / todo);
    })
  );

  constructor(private lazyData: LazyDataService, private http: HttpClient, private serializer: NgSerializerService,
              private extractor: DataExtractorService) {
  }

  ngOnInit() {
    const chunks = _.chunk(Object.keys(this.lazyData.data.items), 100);
    this.totalTodo$.next(chunks.length);
    requestsWithDelay(chunks.map(itemIds => {
      return this.http.get<any[]>(`https://www.garlandtools.org/db/doc/item/en/3/${itemIds.join(',')}.json`).pipe(
        map(items => this.serializer.deserialize<ItemData>(items.filter(i => !i.error).map(item => item.obj), [ItemData])),
        switchMap((items: ItemData[]) => {
          if (items.length === 0) {
            return of([]);
          }
          return combineLatest(items.map(data => {
            const item: any = {
              id: data.item.id
            };
            return this.extractor.addDataToItem(item, data).pipe(
              map(extract => {
                delete extract.yield;
                delete extract.requires;
                delete extract.workingOnIt;
                return extract;
              })
            );
          })).pipe(
            first()
          );
        }),
        tap(() => {
          this.done$.next(this.done$.value + 1);
        })
      );
    }), 200).subscribe(items => {
      const blob = new Blob([JSON.stringify([].concat.apply([], items).reduce((acc, i) => {
        acc[i.id] = i;
        return acc;
      }, {}))], { type: 'text/plain;charset:utf-8' });
      saveAs(blob, `extracts.json`);
    });
  }

}
