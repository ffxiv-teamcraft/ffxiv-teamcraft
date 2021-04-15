import { combineLatest, Observable } from 'rxjs';
import { ofMessageType } from '../rxjs/of-message-type';
import { filter, first, map, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { merge } from 'rxjs';
import { LazyDataService } from '../data/lazy-data.service';
import { ExplorationResultReporter } from './exploration-result.reporter';
import { ExplorationType } from '../../model/other/exploration-type';
import { toIpcData } from '../rxjs/to-ipc-data';

export class SubmarineExplorationResultReporter extends ExplorationResultReporter {

  constructor(private lazyData: LazyDataService) {
    super();
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const isSubmarineMenuOpen$: Observable<boolean> = merge(
      packets$.pipe(ofMessageType('eventStart')),
      packets$.pipe(ofMessageType('eventFinish'))
    ).pipe(
      filter((packet) => packet.parsedIpcData.eventId === 0xB01BF),
      map((packet) => {
        return packet.type === 'eventStart';
      }),
      startWith(false),
      shareReplay(1)
    );

    const resultLog$ = packets$.pipe(
      ofMessageType('submarineExplorationResult'),
      toIpcData(),
      map((packet) => packet.explorationResult)
    );

    const statusList$ = packets$.pipe(
      ofMessageType('submarineStatusList'),
      toIpcData(),
      map((packet) => packet.statusList)
    );

    const updateHullCondition$ = packets$.pipe(
      ofMessageType('updateInventorySlot'),
      toIpcData(),
      withLatestFrom(isSubmarineMenuOpen$),
      filter(([updateInventory, isOpen]) => {
        return isOpen && updateInventory.containerId === 25004 && [0, 5, 10, 15].includes(updateInventory.slot) && updateInventory.condition < 30000;
      }),
      map(([updateInventory]) => updateInventory.slot / 5)
    );


    return resultLog$.pipe(
      withLatestFrom(isSubmarineMenuOpen$),
      filter(([, isOpen]) => isOpen),
      switchMap(([resultLog]) => {
        return combineLatest([updateHullCondition$, statusList$]).pipe(
          map(([submarineSlot, statusList]) => {
            const submarine = statusList[submarineSlot];
            const stats = this.getBuildStats(submarine.rank, submarine.hull, submarine.stern, submarine.bow, submarine.bridge);
            return this.createReportsList(stats, resultLog);
          }),
          // Once the report is sent, dispose this Observable so the next emission of stats won't trigger a new report
          first()
        );
      })
    );
  }

  getExplorationType(): ExplorationType {
    return ExplorationType.SUBMARINE;
  }

  private getBuildStats(rankId: number, hullId: number, sternId: number, bowId: number, bridgeId: number): { surveillance: number, retrieval: number, favor: number } {
    const hull = this.lazyData.data.submarineParts[hullId];
    const stern = this.lazyData.data.submarineParts[sternId];
    const bow = this.lazyData.data.submarineParts[bowId];
    const bridge = this.lazyData.data.submarineParts[bridgeId];
    const rank = this.lazyData.data.submarineRanks[rankId];
    return {
      surveillance: +hull.surveillance + +stern.surveillance + +bow.surveillance + +bridge.surveillance + +rank.surveillanceBonus,
      retrieval: +hull.retrieval + +stern.retrieval + +bow.retrieval + +bridge.retrieval + +rank.retrievalBonus,
      favor: +hull.favor + +stern.favor + bow.favor + +bridge.favor + +rank.favorBonus
    };
  }
}
