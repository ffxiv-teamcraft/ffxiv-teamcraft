import { DataReporter } from './data-reporter';
import { Observable } from 'rxjs/Observable';
import { ofPacketType } from '../rxjs/of-packet-type';
import { filter, map, shareReplay, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { merge } from 'rxjs';
import { LazyDataService } from '../data/lazy-data.service';
import { ExplorationResultReporter } from './exploration-result.reporter';
import { ExplorationType } from '../../model/other/exploration-type';
import { UpdateInventorySlot } from '../../model/pcap';
import { SubmarineStatusList } from '../../model/pcap/SubmarineStatusList';
import { SubmarineExplorationResult } from '../../model/pcap/SubmarineExplorationResult';

export class SubmarineExplorationResultReporter implements DataReporter, ExplorationResultReporter {

  constructor(private lazyData: LazyDataService) {
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
      map((packet) => packet.explorationResult),
      tap((data) => {
        console.log(data);
      })
    );

    const statusList$ = packets$.pipe(
      ofPacketType<SubmarineStatusList>('submarineStatusList'),
      map((packet) => packet.statusList),
      tap((data) => {
        console.log(data);
      })
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
      tap((data) => {
        console.log(data);
      }),
      map(([submarineSlot, statusList]) => {
        const submarine = statusList[submarineSlot];
        return this.getBuildStats(submarine.rank, submarine.hull, submarine.stern, submarine.bow, submarine.bridge);
      }),
      tap((data) => {
        console.log(data);
      }),
      withLatestFrom(resultLog$),
      map(([stats, resultLog]): any[] => {
        const reports = [];
        resultLog.forEach((voyage) => {
          if (voyage.sectorId > 0) {
            reports.push({
              voyageId: voyage.sectorId,
              itemId: voyage.loot1ItemId,
              hq: voyage.loot1IsHQ,
              quantity: voyage.loot1Quantity,
              surveillanceProc: voyage.loot1SurveillanceResult,
              retrievalProc: voyage.loot1RetrievalResult,
              favorProc: voyage.favorResult,
              surveillance: stats.surveillance,
              retrieval: stats.retrieval,
              favor: stats.favor,
              type: this.getExplorationType()
            });
            if (voyage.loot2ItemId > 0) {
              reports.push({
                voyageId: voyage.sectorId,
                itemId: voyage.loot2ItemId,
                hq: voyage.loot2IsHQ,
                quantity: voyage.loot2Quantity,
                surveillanceProc: voyage.loot2SurveillanceResult,
                retrievalProc: voyage.loot2RetrievalResult,
                favorProc: null,
                surveillance: stats.surveillance,
                retrieval: stats.retrieval,
                favor: stats.favor,
                type: this.getExplorationType()
              });
            }
          }
        });
        return reports;
      })
    );
  }

  getDataType(): string {
    return 'explorationresults';
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
