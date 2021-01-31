import { Observable } from 'rxjs/Observable';
import { ofPacketType } from '../rxjs/of-packet-type';
import { filter, map, shareReplay, startWith, withLatestFrom } from 'rxjs/operators';
import { merge } from 'rxjs';
import { LazyDataService } from '../data/lazy-data.service';
import { ExplorationResultReporter } from './exploration-result.reporter';
import { ExplorationType } from '../../model/other/exploration-type';
import { UpdateInventorySlot } from '../../model/pcap';
import { SubmarineStatusList } from '../../model/pcap';
import { SubmarineExplorationResult } from '../../model/pcap';

export class SubmarineExplorationResultReporter extends ExplorationResultReporter {

  constructor(private lazyData: LazyDataService) {
    super();
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const isSubmarineMenuOpen$: Observable<boolean> = merge(
      packets$.pipe(ofPacketType('eventStart')),
      packets$.pipe(ofPacketType('eventFinish'))
    ).pipe(
      filter((packet) => packet.eventId === 0xB01BF),
      map((packet) => {
        return packet.type === 'eventStart';
      }),
      startWith(false),
      shareReplay(1)
    );

    const resultLog$ = packets$.pipe(
      ofPacketType<SubmarineExplorationResult>('submarineExplorationResult'),
      map((packet) => packet.explorationResult)
    );

    const statusList$ = packets$.pipe(
      ofPacketType<SubmarineStatusList>('submarineStatusList'),
      map((packet) => packet.statusList)
    );

    const updateHullCondition$ = packets$.pipe(
      ofPacketType<UpdateInventorySlot>('updateInventorySlot'),
      withLatestFrom(isSubmarineMenuOpen$),
      filter(([updateInventory, isOpen]) => {
        return isOpen && updateInventory.containerId === 25004 && [0, 5, 10, 15].includes(updateInventory.slot) && updateInventory.condition < 30000;
      })
    );

    return updateHullCondition$.pipe(
      map(([updateInventory]) => updateInventory.slot / 5),
      withLatestFrom(statusList$),
      map(([submarineSlot, statusList]) => {
        const submarine = statusList[submarineSlot];
        return this.getBuildStats(submarine.rank, submarine.hull, submarine.stern, submarine.bow, submarine.bridge);
      }),
      withLatestFrom(resultLog$),
      map(([stats, resultLog]): any[] => this.createReportsList(stats, resultLog))
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
