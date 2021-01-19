import { DataReporter } from './data-reporter';
import { Observable } from 'rxjs/Observable';
import { ofPacketType } from '../rxjs/of-packet-type';
import { filter, map, shareReplay, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { merge } from 'rxjs';
import { LazyDataService } from '../data/lazy-data.service';
import { ExplorationResultReporter, ExplorationType } from './exploration-result.reporter';

export class SubmarineExplorationResultReporter implements DataReporter, ExplorationResultReporter {
  private statusList$;
  private resultLog$;

  constructor(private lazyData: LazyDataService) {
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const isSubmarineMenuOpen$ = merge(
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

    this.resultLog$ = packets$.pipe(
      ofPacketType('submarineExplorationResult'),
      map((packet) => packet.explorationResult),
      tap((data) => {
        console.log(data);
      })
    );

    this.statusList$ = packets$.pipe(
      ofPacketType('submarineStatusList'),
      map((packet) => packet.statusList),
      tap((data) => {
        console.log(data);
      })
    );

    const voyages$ = packets$.pipe(
      ofPacketType('updateInventorySlot'),
      withLatestFrom(isSubmarineMenuOpen$),
      filter(([updateInventory, isOpen]) => {
        return isOpen && updateInventory.containerId === 25004 && [0, 5, 10, 15].includes(updateInventory.slot) && updateInventory.condition < 30000;
      }),
      map(([updateInventory]) => updateInventory.slot / 5),
      withLatestFrom(this.statusList$),
      tap((data) => {
        console.log(data);
      }),
      map(([submarineSlot, statusList]) => {
        const submarine = statusList[submarineSlot];
        console.log('BUIIIILDS');
        return this.getBuildStats(submarine.rank, submarine.hull, submarine.stern, submarine.bow, submarine.bridge);
      }),
      tap((data) => {
        console.log(data);
      }),
      withLatestFrom(this.resultLog$),
      map(([stats, resultLog]: any[]): any[] => {
        const reports = [];
        resultLog.forEach((voyage) => {
          reports.push({
            voyageId: voyage.sectorId,
            itemId: voyage.loot1ItemId,
            hq: voyage.loot1isHQ,
            quantity: voyage.loot1Quantity,
            surveillanceProc: voyage.loot1SurveillanceResult,
            retrievalProc: voyage.loot1RetrievalResult,
            favorProc: voyage.favorResult,
            surveillance: stats.surveillance,
            retrieval: stats.retrieval,
            favor: stats.favor,
            type: this.getExplorationType()
          });
          if (voyage.loot2ItemId) {
            reports.push({
              voyageId: voyage.sectorId,
              itemId: voyage.loot2ItemId,
              hq: voyage.loot2isHQ,
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
        });
        return reports;
      }),
      tap((data) => {
        console.log(data);
      })
    );

    return voyages$.pipe(
      map((data: any[]) => {
        return data;
      })
    );
  }

  getDataType(): string {
    return 'submarineExplorationResult';
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
      surveillance: +hull.Surveillance + +stern.Surveillance + +bow.Surveillance + +bridge.Surveillance + +rank.SurveillanceBonus,
      retrieval: +hull.Retrieval + +stern.Retrieval + +bow.Retrieval + +bridge.Retrieval + +rank.RetrievalBonus,
      favor: +hull.Favor + +stern.Favor + bow.Favor + +bridge.Favor + +rank.FavorBonus
    };
  }
}
