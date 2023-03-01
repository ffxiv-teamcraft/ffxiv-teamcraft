import { Component } from '@angular/core';
import { FishTrainFacade } from '../../../modules/fish-train/fish-train/fish-train.facade';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { first, map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { DataType, FishTrainStop, GatheringNode, getExtract, getItemSource } from '@ffxiv-teamcraft/types';
import { combineLatest, interval } from 'rxjs';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthFacade } from '../../../+state/auth.facade';

@Component({
  selector: 'app-fish-train',
  templateUrl: './fish-train.component.html',
  styleUrls: ['./fish-train.component.less']
})
export class FishTrainComponent extends TeamcraftComponent {

  fishTrain$ = this.fishTrainFacade.selectedFishTrain$;

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

  time$ = interval(1000).pipe(
    map(() => 1677285400000 - 10000)
  );

  display$ = combineLatest([
    this.time$,
    this.fishTrainWithLocations$,
    this.authFacade.userId$
  ]).pipe(
    map(([time, train, userId]) => {
      const stop = train.fish[train.fish.length - 1].end;
      const stopped = stop <= time;
      const running = !stopped && train.start <= time;
      const waiting = train.start >= time;
      const current = train.fish.find(stop => stop.start <= time && stop.end >= time);
      const currentIndex = train.fish.indexOf(current);
      return {
        ...train,
        current,
        currentIndex,
        stop,
        stopped,
        running,
        waiting,
        time
      };
    }),
    shareReplay(1)
  );

  macroPopoverShown = false;

  constructor(private fishTrainFacade: FishTrainFacade, private route: ActivatedRoute,
              private lazyData: LazyDataFacade, private i18n: I18nToolsService,
              private translate: TranslateService, private authFacade: AuthFacade) {
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

}
