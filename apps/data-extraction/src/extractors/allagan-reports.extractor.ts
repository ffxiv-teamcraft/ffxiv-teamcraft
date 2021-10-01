import { switchMap, tap } from 'rxjs/operators';
import { AbstractExtractor } from '../abstract-extractor';
import { pickBy } from 'lodash';

enum AllaganReportSource {
  FISHING = 'FISHING',
  SPEARFISHING = 'SPEARFISHING',
  DESYNTH = 'DESYNTH',
  REDUCTION = 'REDUCTION',
  GARDENING = 'GARDENING',
  LOOT = 'LOOT', // Obtained by using a given item (timeworn maps, sacks, chests, etc)

  VENTURE = 'VENTURE', // Retainer venture
  VOYAGE = 'VOYAGE', // Airship/Submarine voyage
  DROP = 'DROP', // Drop from monsters kill
  INSTANCE = 'INSTANCE', // Obtained inside an instance
  FATE = 'FATE', // Obtained as fate reward
}

export class AllaganReportsExtractor extends AbstractExtractor {

  private identity = (row) => {
    return row !== undefined && row !== null && (!Array.isArray(row) || row.length > 0);
  };

  protected doExtract(): any {
    this.gubalRequest(`
    query AllaganReportsExtractor {
      allagan_reports {
        itemId
        source
        data
      }
    }`).pipe(
      tap(res => {
        const desynth = this.requireLazyFile('desynth');
        const reduction = this.requireLazyFile('reduction');
        const voyageSources = this.requireLazyFile('voyage-sources');
        const fishing = {};
        const spearFishing = {};
        const loots = {};
        const ventures = {};
        const drops = {};
        const instanceDrops = {};
        const fateSources = {};

        res.data.allagan_reports.forEach(report => {
          switch (report.source) {
            case AllaganReportSource.DESYNTH:
              this.addItemAsSource(desynth, report.itemId, report.data.itemId);
              break;
            case AllaganReportSource.REDUCTION:
              this.addItemAsSource(reduction, report.itemId, report.data.itemId);
              break;
            case AllaganReportSource.GARDENING:
              // Let's ignore gardening for now since the seeds extractor does the job
              break;
            case AllaganReportSource.LOOT:
              this.addItemAsSource(loots, report.itemId, report.data.itemId);
              break;
            case AllaganReportSource.INSTANCE:
              this.addItemAsSource(instanceDrops, report.itemId, report.data.instanceId);
              break;
            case AllaganReportSource.VENTURE:
              this.addItemAsSource(ventures, report.itemId, report.data.ventureId);
              break;
            case AllaganReportSource.DROP:
              this.addItemAsSource(drops, report.itemId, report.data.monsterId);
              break;
            case AllaganReportSource.FATE:
              this.addItemAsSource(fateSources, report.itemId, report.data.fateId);
              break;
            case AllaganReportSource.VOYAGE:
              this.addItemAsSource(voyageSources, report.itemId, { id: report.data.voyageId, type: report.data.voyageType });
              break;
            case AllaganReportSource.SPEARFISHING:
              this.addItemAsSource(spearFishing, report.itemId, pickBy({
                gig: report.data.gig,
                predators: report.data.predators,
                spawn: report.data.spawn,
                duration: report.data.duration
              }, this.identity));
              return;
            case AllaganReportSource.FISHING:
              return this.addItemAsSource(fishing, report.itemId, pickBy({
                spot: report.data.spot,
                hookset: report.data.hookset,
                tug: report.data.tug,
                bait: report.data.bait,
                spawn: report.data.spawn,
                duration: report.data.duration,
                weathers: report.data.weathers,
                weathersFrom: report.data.weathersFrom,
                snagging: report.data.snagging,
                predators: report.data.predators,
                oceanFishingTime: report.data.oceanFishingTime
              }, this.identity));
          }
        });

        this.persistToJsonAsset('desynth', desynth);
        this.persistToJsonAsset('reduction', reduction);
        this.persistToJsonAsset('voyage-sources', voyageSources);
        this.persistToJsonAsset('fishing-sources', fishing);
        this.persistToJsonAsset('spearfishing-sources', spearFishing);
        this.persistToJsonAsset('loot-sources', loots);
        this.persistToJsonAsset('venture-sources', ventures);
        this.persistToJsonAsset('drop-sources', drops);
        this.persistToJsonAsset('instance-sources', instanceDrops);
        this.persistToJsonAsset('fate-sources', fateSources);
      }),
      switchMap(() => {
        return this.gubalRequest(`
        mutation AllaganReportsExtractorApply {
          update_allagan_reports(where: {applied: { _eq: false}}, _set: {applied: true}){
            affected_rows
          }
        }`);
      })
    ).subscribe((data) => {
      this.done();
    });
  }

  private addItemAsSource(targetObject: Object, targetItem: number, sourceDetails: any): void {
    targetObject[targetItem] = [...(targetObject[targetItem] || []), sourceDetails];
  }

  getName(): string {
    return 'allagan-reports';
  }

}
