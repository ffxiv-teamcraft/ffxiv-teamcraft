import { Component } from '@angular/core';
import { requestsWithDelay } from '../../../core/rxjs/requests-with-delay';
import { HttpClient } from '@angular/common/http';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { ItemData } from '../../../model/garland-tools/item-data';
import { saveAs } from 'file-saver';
import { DataExtractorService } from '../../../modules/list/data/data-extractor.service';
import * as _ from 'lodash';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject } from 'rxjs';
import { LazyDataWithExtracts } from '../../../lazy-data/lazy-data-types';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { environment } from 'apps/client/src/environments/environment';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { getItemSource } from '../../../modules/list/model/list-row';
import { DataType } from '../../../modules/list/data/data-type';

@Component({
  selector: 'app-extractor',
  templateUrl: './extractor.component.html',
  styleUrls: ['./extractor.component.less']
})
export class ExtractorComponent {

  public running = false;

  public currentLabel = '';

  public done$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public totalTodo$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public progress$: Observable<number> = combineLatest([this.done$, this.totalTodo$]).pipe(
    filter(([, todo]) => todo > 0),
    map(([done, todo]) => {
      return Math.round(done * 100 / todo);
    })
  );

  constructor(private lazyData: LazyDataFacade, private http: HttpClient, private serializer: NgSerializerService,
              private extractor: DataExtractorService, private gatheringNodesService: GatheringNodesService,
              private alarmsFacade: AlarmsFacade) {
  }

  public doEverything(): void {
    this.running = true;
    this.doExtracts().pipe(
      switchMap(extracts => {
        return combineLatest([
          this.doCollectablesData(),
          this.doLogTrackingData(extracts)
        ]);
      })
    ).subscribe();
  }

  public doLogTrackingData(extractsInput?: LazyDataWithExtracts['extracts']): Observable<any> {
    const extracts$ = extractsInput ? of(extractsInput) : this.lazyData.getEntry('extracts');
    this.running = true;
    this.currentLabel = 'Log tracking data';
    const res$ = new ReplaySubject<any>();
    this.totalTodo$.next(12);
    this.done$.next(0);
    const dohTabs$ = combineLatest([
      this.lazyData.getEntry('craftingLogPages'),
      this.lazyData.getEntry('leves'),
      this.lazyData.getEntry('notebookDivision')
    ]).pipe(
      map(([pages, leves, notebookDivision]) => {
        return pages.map(page => {
          this.done$.next(this.done$.value + 1);
          return page.map(tab => {
            (tab as any).divisionId = +Object.keys(notebookDivision).find(key => {
              return notebookDivision[key].pages.includes(tab.id);
            });
            const division = notebookDivision[(tab as any).divisionId];
            (tab as any).requiredForAchievement = /\d{1,2}-\d{1,2}/.test(division.name.en) || division.name.en.startsWith('Housing');
            tab.recipes = tab.recipes.map(entry => {
              (entry as any).leves = Object.entries<any>(leves)
                .filter(([, leve]) => {
                  return leve.items.some(i => i.itemId === entry.itemId);
                })
                .map(([id]) => +id);
              return entry;
            });
            return tab;
          });
        });
      })
    );
    const dolTabs$ = combineLatest([
      this.lazyData.getEntry('gatheringLogPages'),
      this.lazyData.getEntry('notebookDivision'),
      extracts$
    ]).pipe(
      map(([pages, notebookDivision, extracts]) => {
        return pages.map(page => {
          this.done$.next(this.done$.value + 1);
          return page.map(tab => {
            (tab as any).divisionId = +Object.keys(notebookDivision).find(key => {
              return notebookDivision[key].pages.includes(tab.id);
            });
            const division = notebookDivision[(tab as any).divisionId];
            (tab as any).requiredForAchievement = /\d{1,2}-\d{1,2}/.test(division.name.en) || division.name.en.startsWith('Housing');
            tab.items = tab.items.map(item => {
              (item as any).nodes = getItemSource(extracts[item.itemId], DataType.GATHERED_BY).nodes
                .slice(0, 3)
                .map(node => {
                  return {
                    gatheringNode: node,
                    alarms: node.limited ? this.alarmsFacade.generateAlarms(node) : []
                  };
                });
              return item;
            });
            return tab;
          });
        });
      })
    );
    combineLatest([
      dohTabs$,
      dolTabs$
    ]).subscribe(([dohTabs, dolTabs]) => {
      const finalLogTrackingData = [
        ...dohTabs,
        ...dolTabs
      ];
      this.downloadFile('log-tracker-page-data.json', finalLogTrackingData);
      res$.next(finalLogTrackingData);
    });
    return res$;
  }

  public doCollectablesData(): Observable<LazyDataWithExtracts['collectablesPageData']> {
    this.running = true;
    this.currentLabel = 'Collectables page data';
    const res$ = new ReplaySubject<LazyDataWithExtracts['collectablesPageData']>();
    this.lazyData.preloadEntry('paramGrow');
    const jobs = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    this.totalTodo$.next(jobs.length);
    this.done$.next(0);
    safeCombineLatest(jobs.map((job) => {
      return this.getCollectables(job).pipe(
        map(groups => {
          this.done$.next(this.done$.value + 1);
          return { job, groups };
        })
      );
    })).subscribe(collectablesPageData => {
      const indexed = collectablesPageData.reduce((acc, { job, groups }) => {
        return {
          ...acc,
          [job]: groups
        };
      }, {});
      this.downloadFile('collectables-page-data.json', indexed);
      res$.next(indexed);
    });
    return res$;
  }

  public doExtracts(): Observable<LazyDataWithExtracts['extracts']> {
    this.running = true;
    this.currentLabel = 'Extracts';
    const res$ = new ReplaySubject<LazyDataWithExtracts['extracts']>();
    this.lazyData.getEntry('items').pipe(
      switchMap(lazyItems => {
        const chunks = _.chunk(Object.keys(lazyItems), 100);
        this.totalTodo$.next(chunks.length);
        return requestsWithDelay(chunks.map(itemIds => {
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
        }), 200);
      })
    ).subscribe(items => {
      const extracts = [].concat.apply([], items).reduce((acc, i) => {
        acc[i.id] = i;
        return acc;
      }, {});
      this.downloadFile('extracts.json', extracts);
      res$.next(extracts);
    });
    return res$;
  }

  private getCollectables(jobId: number): Observable<any[]> {
    return combineLatest([
      this.lazyData.getEntry('collectables'),
      this.lazyData.getEntry('collectablesShops')
    ]).pipe(
      switchMap(([collectables, collectablesShops]) => {
        return combineLatest(Object.keys(collectables)
          .filter(key => {
            const collectableEntry = collectables[key];
            if (collectableEntry.hwd || !collectableEntry.collectable) {
              return false;
            }
            const job = Object.keys(collectablesShops).find(sKey => {
              return collectablesShops[sKey].includes(collectableEntry.shopId);
            });
            return job !== undefined && (+job + 8) === jobId;
          })
          .map(key => {
            return {
              ...collectables[key],
              itemId: +key,
              amount: 1
            };
          })
          .reduce((acc, row) => {
            let group = acc.find(accRow => accRow.groupId === row.group);
            if (group === undefined) {
              acc.push({
                groupId: row.group,
                collectables: []
              });
              group = acc[acc.length - 1];
            }
            group.collectables.push(row);
            return acc;
          }, [])
          .map(group => {
            return safeCombineLatest(group.collectables
              .sort((a, b) => b.levelMax - a.levelMax)
              .map(collectable => {
                return combineLatest([
                  this.getExp(collectable, collectable.base.exp),
                  this.getExp(collectable, collectable.mid.exp),
                  this.getExp(collectable, collectable.high.exp)
                ]).pipe(
                  switchMap(([expBase, expMid, expHigh]) => {
                    collectable.expBase = expBase;
                    collectable.expMid = expMid;
                    collectable.expHigh = expHigh;
                    if ([16, 17, 18].includes(jobId)) {
                      return this.gatheringNodesService.getItemNodes(collectable.itemId, true).pipe(
                        map(nodes => {
                          collectable.nodes = nodes.map(gatheringNode => {
                            return {
                              gatheringNode,
                              alarms: gatheringNode.limited ? this.alarmsFacade.generateAlarms(gatheringNode) : []
                            };
                          });
                          return collectable;
                        })
                      );
                    }
                    return of(collectable);
                  })
                );
              })
            ).pipe(
              map(res => {
                group.collectables = res;
                return group;
              })
            );
          })
        );
      })
    );
  }

  private getExp(collectable: any, ratio: number): Observable<number[]> {
    return combineLatest(new Array(environment.maxLevel).fill(null).map((ignored, index) => {
      const level = index + 1;
      const firstCollectableDigit = Math.floor(collectable.levelMax / 10);
      const firstLevelDigit = Math.floor(level / 10);
      let nerfedExp = firstCollectableDigit < firstLevelDigit;
      if (level % 10 === 0 && level > collectable.levelMax) {
        nerfedExp = nerfedExp && (firstCollectableDigit + 1) < firstLevelDigit
          || (level - collectable.levelMax) >= 10
          || collectable.levelMax % 10 === 0;
      }
      if (nerfedExp) {
        return of(10000);
      }
      return this.lazyData.getRow('paramGrow', collectable.levelMax).pipe(
        map(row => row.ExpToNext * ratio / 1000)
      );
    })).pipe(
      map(expArray => expArray.filter(v => v !== 10000))
    );
  }

  private downloadFile(filename: string, data: any): void {
    const blob = new Blob([JSON.stringify(data)], { type: 'text/plain;charset:utf-8' });
    saveAs(blob, filename);
  }

}
