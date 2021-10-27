import { ExplorationType } from '../../model/other/exploration-type';
import { DataReporter } from './data-reporter';
import { Observable } from 'rxjs';
import { ExplorationResult } from './exploration-result';

export abstract class ExplorationResultReporter implements DataReporter {
  private static ALREADY_SENT_HASHES = JSON.parse(localStorage.getItem(`exploration-reporter:hashes`) || '[]');

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

  /**
   * Checks if a report has not already been sent.
   *
   * If it has never been sent, it'll add it to the hashes, meaning that calling this method twice will always return false.
   *
   * @param returnTime
   * @param birthDate
   * @param log
   * @protected
   */
  protected shouldSendReport(returnTime: number, birthDate: number, log: any[]): boolean {
    if (returnTime < 0 || returnTime > Math.floor(Date.now() / 1000)) {
      return false;
    }
    const hash = this.hash(`${returnTime}:${birthDate}:${JSON.stringify(log)}`);
    const reportSent = ExplorationResultReporter.ALREADY_SENT_HASHES.includes(hash);
    if (reportSent) {
      return false;
    } else {
      this.addToHashes(hash);
      return true;
    }
  }

  private addToHashes(hash: number): void {
    ExplorationResultReporter.ALREADY_SENT_HASHES.push(hash);
    localStorage.setItem(`exploration-reporter:hashes`, JSON.stringify(ExplorationResultReporter.ALREADY_SENT_HASHES));
  }

  private hash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}
