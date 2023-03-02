import { Component } from '@angular/core';
import { FishTrainFacade } from '../../../modules/fish-train/fish-train/fish-train.facade';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { distinctUntilChanged, first, map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { DataType, FishTrainStop, GatheringNode, getExtract, getItemSource } from '@ffxiv-teamcraft/types';
import { combineLatest } from 'rxjs';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { FishDataService } from '../../db/service/fish-data.service';
import { findLastIndex } from 'lodash';
import { PlatformService } from '../../../core/tools/platform.service';
import { IpcService } from '../../../core/electron/ipc.service';

@Component({
  selector: 'app-fish-train',
  templateUrl: './fish-train.component.html',
  styleUrls: ['./fish-train.component.less']
})
export class FishTrainComponent extends TeamcraftComponent {

  fishTrain$ = this.fishTrainFacade.selectedFishTrain$;

  gubalFishTrainStats$ = this.fishTrain$.pipe(
    map(train => train.$key),
    distinctUntilChanged(),
    switchMap(trainId => {
      return this.fishDataService.getTrainStats(trainId);
    })
  );

  fishTrainWithLocations$ = this.fishTrain$.pipe(
    switchMap(train => {
      return this.lazyData.getRows('extracts', ...train.fish.map(stop => stop.id)).pipe(
        map(extracts => {
          return {
            ...train,
            fish: train.fish.map(stop => {
              return {
                ...stop,
                node: getItemSource(getExtract(extracts, stop.id), DataType.GATHERED_BY)?.nodes[0]
              };
            })
          };
        })
      );
    })
  );

  display$ = combineLatest([
    this.fishTrainFacade.time$,
    this.fishTrainWithLocations$,
    this.fishTrainFacade.currentTrain$,
    this.gubalFishTrainStats$
  ]).pipe(
    map(([time, train, currentTrain, gubalStats]) => {
      let stops = train.fish;
      const stop = train.fish[train.fish.length - 1].end;
      const stopped = stop <= time;
      const running = !stopped && train.start <= time;
      const waiting = train.start >= time;
      let current = train.fish.find(stop => stop.start <= time && stop.end >= time);
      // If there's no current fish but train is running, we're moving to the next one !
      if (!current && running) {
        const lastIndex = findLastIndex(train.fish, stop => stop.start <= time);
        current = train.fish[lastIndex + 1] || null;
      }
      let currentIndex = train.fish.indexOf(current);
      if (currentIndex > 1 && running) {
        stops = stops.slice(currentIndex - 1);
        currentIndex = 1;
      }
      const matchingItemIds = train.fish.map(fish => fish.id);
      const accuracy = gubalStats.reports.length === 0 ? 0 :
        gubalStats.reports.filter(report => matchingItemIds.includes(report.itemId)).length / gubalStats.reports.length;
      const durationHours = (time - train.start) / (60000 * 60);
      const rate = Math.floor(100 * gubalStats.reports.filter(report => matchingItemIds.includes(report.itemId)).length / durationHours) / 100;
      return {
        ...train,
        stops,
        current,
        currentIndex,
        stop,
        stopped,
        running,
        waiting,
        time,
        currentTrain,
        gubalStats,
        accuracy,
        rate,
        reports: gubalStats.reports
      };
    }),
    shareReplay(1)
  );

  macroPopoverShown = false;

  constructor(private fishTrainFacade: FishTrainFacade, private route: ActivatedRoute,
              private lazyData: LazyDataFacade, private i18n: I18nToolsService,
              private translate: TranslateService, private fishDataService: FishDataService,
              public platform: PlatformService, private ipc: IpcService) {
    super();
    route.paramMap
      .pipe(
        map(params => params.get('id')),
        takeUntil(this.onDestroy$)
      )
      .subscribe(id => {
        this.fishTrainFacade.load(id);
        this.fishTrainFacade.select(id);
      });
  }

  getMacro = (current: FishTrainStop & { node: GatheringNode }, macroKey: string, useCurrentPos = false) => {
    return combineLatest([
      this.i18n.getNameObservable('items', current.id),
      this.i18n.getNameObservable('items', current.node.baits[current.node.baits.length - 1].id),
      this.lazyData.getEntry('mapEntries').pipe(
        switchMap(entries => this.i18n.getNameObservable('places', entries.find(e => e.id === current.node.map)?.zone))
      )
    ]).pipe(
      first(),
      map(([itemName, baitName, mapName]) => {
        return this.translate.instant(`FISH_TRAIN.${macroKey}`, {
          itemName,
          mapName,
          coords: useCurrentPos ? '<pos>' : `X:${current.node.x} - Y:${current.node.y}`,
          bait: baitName,
          minGathering: current.node.minGathering
        });
      })
    );
  };

  boardTrain(id: string): void {
    this.fishTrainFacade.boardTrain(id);
  }

  leaveTrain(id: string): void {
    this.fishTrainFacade.leaveTrain(id);
  }

  openFishingOverlay(): void {
    this.ipc.openOverlay('/fishing-reporter-overlay');
  }

}
