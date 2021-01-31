import { ExplorationType } from '../../model/other/exploration-type';
import { DataReporter } from './data-reporter';
import { Observable } from 'rxjs/Observable';
import { ExplorationResult } from './exploration-result';

export abstract class ExplorationResultReporter implements DataReporter{
  abstract getDataReports(packets$: Observable<any>): Observable<any[]>;
  abstract getExplorationType(): ExplorationType;

  createReportsList(stats, resultLog) {
    const reports: ExplorationResult[] = [];

    resultLog.forEach((voyage) => {
      if (this.isSectorIdValid(voyage.sectorId)) {
        reports.push({
          voyageId: voyage.sectorId,
          itemId: voyage.loot1ItemId,
          hq: voyage.loot1IsHq,
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
            hq: voyage.loot2IsHq,
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
  }

  /**
   * Check if sectorId is valid.
   *
   * Submarine: the first explorable sector starts at 1
   * Airship: the first explorable sector starts at 0
   *
   * @param sectorId
   */
  isSectorIdValid(sectorId: number): boolean {
    return this.getExplorationType() === ExplorationType.SUBMARINE ? sectorId > 0 : sectorId > -1;
  }

  getDataType(): string {
    return 'explorationresults';
  }
}
