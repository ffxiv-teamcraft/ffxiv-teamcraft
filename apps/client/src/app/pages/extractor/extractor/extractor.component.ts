import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { bufferCount, bufferTime, filter, map, mergeMap, scan, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { DataExtractorService } from '../../../modules/list/data/data-extractor.service';
import { uniqBy } from 'lodash';
import { BehaviorSubject, combineLatest, from, Observable, of, ReplaySubject } from 'rxjs';
import { LazyDataWithExtracts } from '../../../lazy-data/lazy-data-types';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { DataType } from '../../../modules/list/data/data-type';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { Alarm } from '../../../core/alarms/alarm';
import { EnvironmentService } from '../../../core/environment.service';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { updatedItemIds } from '../../../core/data/sources/updated-items';

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

  public rate$ = this.progress$.pipe(
    bufferTime(100),
    scan((acc, buff) => {
      acc = [
        buff,
        ...acc
      ];
      if (acc.length > 100) {
        acc.pop();
      }
      return acc;
    }, []),
    map(snaps => {
      return Math.floor(snaps.reduce((acc, snap) => {
        return acc + snap.length;
      }, 0) * 10 / snaps.length) / 10;
    }),
    startWith(1)
  );

  public eta$ = combineLatest([this.rate$, this.totalTodo$, this.done$]).pipe(
    map(([rate, todo, done]) => {
      const resSeconds = (todo - done) / rate;
      return {
        min: Math.floor(resSeconds / 60),
        sec: Math.floor(resSeconds % 60).toString().padStart(2, '0')
      };
    })
  );

  constructor(private lazyData: LazyDataFacade, private http: HttpClient, private serializer: NgSerializerService,
              private extractor: DataExtractorService, private gatheringNodesService: GatheringNodesService,
              private alarmsFacade: AlarmsFacade, private environment: EnvironmentService) {
  }

  public doEverything(): void {
    this.running = true;
    this.doExtracts(false).pipe(
      switchMap(extracts => {
        return combineLatest([
          this.doCollectablesData(),
          this.doLogTrackingData(extracts)
        ]);
      })
    ).subscribe();
  }

  public doLogTrackingData(extractsInput?: LazyDataWithExtracts['extracts']): Observable<void> {
    const extracts$ = extractsInput ? of(extractsInput) : this.lazyData.getEntry('extracts');
    this.running = true;
    this.currentLabel = 'Log tracking data';
    const res$ = new ReplaySubject<void>();
    this.totalTodo$.next(14);
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
            (tab as any).requiredForAchievement = /\d{1,2}-\d{1,2}/.test(division.name.en)
              || division.name.en.startsWith('Fixtures') ||
              division.name.en.indexOf('Furnishings') > -1 || division.name.en.startsWith('Table') ||
              division.name.en.startsWith('Wall-mounted') || division.name.en.startsWith('Ornaments');
            if ((tab as any).divisionId === 1039) {
              (tab as any).requiredForAchievement = false;
            }
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
            }) || 0;
            const division = notebookDivision[(tab as any).divisionId];
            if (!division) {
              console.log(tab);
            }
            (tab as any).requiredForAchievement = /\d{1,2}-\d{1,2}/.test(division.name.en);
            tab.items = tab.items.map(item => {
              (item as any).nodes = (getItemSource(extracts[item.itemId], DataType.GATHERED_BY).nodes || [])
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


    const fshTabs$ = combineLatest([
      this.lazyData.getMinBtnSpearNodesIndex(),
      this.lazyData.getEntry('fishingLog'),
      this.lazyData.getEntry('spearFishingLog'),
      this.lazyData.getEntry('fishParameter')
    ]).pipe(
      switchMap(([minBtnSpearNodes, fishingLog, spearFishingLog, parameters]) => {
        const fishingLogData$ = combineLatest(fishingLog.map(entry => {
          return this.getFshData(entry.itemId, entry.spot.id).pipe(
            map((fshData) => {
              const fish: any = {
                entry,
                id: entry.spot.id,
                itemId: entry.itemId,
                level: entry.level,
                icon: entry.icon,
                data: fshData
              };
              if (parameters[entry.itemId]) {
                fish.timed = parameters[entry.itemId].timed;
                fish.weathered = parameters[entry.itemId].weathered;
              }
              return fish;
            })
          );
        }));

        const spearFishingLogData$ = combineLatest(spearFishingLog.map(entry => {
          const spot = minBtnSpearNodes.find(n => n.items.includes(entry.itemId));
          return this.getFshData(entry.itemId, spot.id).pipe(
            map((data) => {
              if (!data[0]) {
                console.log(entry.itemId, spot.id);
              }
              return {
                entry,
                id: spot.id,
                itemId: entry.itemId,
                level: spot.level,
                data: data,
                timed: data[0].gatheringNode.limited,
                tug: data[0].gatheringNode.tug
              };
            })
          );
        }));

        return combineLatest([fishingLogData$, spearFishingLogData$]).pipe(
          map(([fishingFish, spearFishingFish]) => {
            return [fishingFish, spearFishingFish].map(log => {
              this.done$.next(this.done$.value + 1);
              return log
                .filter(fish => fish.entry.mapId !== 358)
                .reduce((display, fish) => {
                  const displayCopy = { ...display };
                  let row = displayCopy.tabs.find(e => e.mapId === fish.entry.mapId);
                  if (row === undefined) {
                    displayCopy.tabs.push({
                      id: fish.id,
                      mapId: fish.entry.mapId,
                      placeId: fish.entry.placeId,
                      done: 0,
                      total: 0,
                      spots: []
                    });
                    row = displayCopy.tabs[displayCopy.tabs.length - 1];
                  }
                  const spotId = fish.entry.spot ? fish.entry.spot.id : fish.entry.id;
                  let spot = row.spots.find(s => s.id === spotId);
                  if (spot === undefined) {
                    const coords = fish.entry.spot ? fish.entry.spot.coords : fish.entry.coords;
                    row.spots.push({
                      id: spotId,
                      placeId: fish.entry.zoneId,
                      mapId: fish.entry.mapId,
                      done: 0,
                      total: 0,
                      coords: coords,
                      fishes: []
                    });
                    spot = row.spots[row.spots.length - 1];
                  }
                  const { entry, ...fishRow } = fish;
                  spot.fishes.push(fishRow);
                  return displayCopy;
                }, { tabs: [], total: 0, done: 0 });
            });
          })
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    combineLatest([
      dohTabs$,
      dolTabs$,
      fshTabs$
    ]).subscribe(([dohTabs, dolTabs, fshTabs]) => {
      const finalLogTrackingData = [
        ...dohTabs,
        ...dolTabs
      ];
      this.downloadFile('log-tracker-page-data.json', finalLogTrackingData);
      this.downloadFile('fishing-log-tracker-page-data.json', fshTabs);
      res$.next();
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

  public doExtracts(onlyUpdatedItems: boolean): Observable<LazyDataWithExtracts['extracts']> {
    this.running = true;
    this.currentLabel = 'Extracts';
    const res$ = new ReplaySubject<LazyDataWithExtracts['extracts']>();
    combineLatest([
      this.lazyData.getEntry('items'),
      this.lazyData.getEntry('islandBuildings')
    ]).pipe(
      switchMap(([lazyItems, islandBuildings]) => {
        const itemIds = onlyUpdatedItems ? updatedItemIds : Object.keys({ ...islandBuildings, ...lazyItems }).sort((a, b) => +a - +b);
        this.totalTodo$.next(itemIds.length);
        return from(itemIds).pipe(
          mergeMap(itemId => {
            let row$: Observable<ListRow> = of({ id: +itemId } as ListRow);
            if (itemId <= -10000) {
              row$ = this.lazyData.getRow('islandBuildings', +itemId).pipe(
                map(building => {
                  return {
                    id: +itemId,
                    contentType: 'islandBuildings',
                    xivapiIcon: building.icon
                  } as ListRow;
                })
              );
            }
            return row$.pipe(
              switchMap(row => this.extractor.addDataToItem(row))
            );
          }, 50),
          tap(() => this.done$.next(this.done$.value + 1)),
          bufferCount(itemIds.length)
        );
      }),
      withLazyData(this.lazyData, 'extracts')
    ).subscribe(([items, lazyExtracts]) => {
      const extracts = [].concat.apply([], items).reduce((acc, i) => {
        acc[i.id] = i;
        return acc;
      }, onlyUpdatedItems ? lazyExtracts : {});
      this.downloadFile('extracts.json', extracts);
      res$.next(extracts);
    });
    return res$;
  }

  private getCollectables(jobId: number): Observable<any> {
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
    return combineLatest(new Array(this.environment.maxLevel).fill(null).map((ignored, index) => {
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

  private getFshData(itemId: number, spotId: number): Observable<{ gatheringNode: GatheringNode, alarms: Alarm[] }[]> {
    return this.gatheringNodesService.getItemNodes(itemId, true)
      .pipe(
        map(nodes => {
          return uniqBy(nodes.filter(node => node.id === spotId)
            .map(node => {
              return {
                gatheringNode: node,
                alarms: this.alarmsFacade.generateAlarms(node)
              };
            }), entry => entry.gatheringNode.baits && entry.gatheringNode.baits[0])
            .slice(0, 3);
        })
      );
  }

  private downloadFile(filename: string, data: any): void {
    const blob = new Blob([JSON.stringify(data)], { type: 'text/plain;charset:utf-8' });
    saveAs(blob, filename);
  }

}
