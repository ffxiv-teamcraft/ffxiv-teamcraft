import { ChangeDetectorRef, Component } from '@angular/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { parse } from 'papaparse';
import { from, Subject, Subscription } from 'rxjs';
import { ReportsManagementComponent } from '../reports-management.component';
import { I18nName } from '../../../model/common/i18n-name';
import { AllaganReportSource } from '../model/allagan-report-source';
import { AllaganReport } from '../model/allagan-report';
import { first, mergeScan, pluck, scan } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { AllaganReportsService } from '../allagan-reports.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TimeUtils } from '../../../core/alarms/time.utils';
import { pickBy } from 'lodash';

@Component({
  selector: 'app-sheet-import-popup',
  templateUrl: './sheet-import-popup.component.html',
  styleUrls: ['./sheet-import-popup.component.less']
})
export class SheetImportPopupComponent extends ReportsManagementComponent {

  public hideUpload = false;

  public dataLength = 1;

  public done = 0;

  public queue: AllaganReport[] = [];

  public handleFile = (event: any) => {
    const reader = new FileReader();
    let data = '';
    reader.onload = ((_) => {
      return (e) => {
        data += e.target.result;
      };
    })(event.file);
    reader.onloadend = () => {
      this.processSheet(data);
    };
    // Read in the image file as a data URL.
    reader.readAsText(event.file);
    this.hideUpload = true;
    return new Subscription();
  };

  constructor(protected lazyData: LazyDataService, private authFacade: AuthFacade,
              private allaganReportsService: AllaganReportsService, private modalRef: NzModalRef,
              private message: NzMessageService, private cd: ChangeDetectorRef) {
    super(lazyData);
  }

  processSheet(content: string): void {
    this.authFacade.userId$.pipe(first()).subscribe(userId => {
      const parsed = parse(content);
      if (parsed.data[0][0] === 'Item') {
        this.importItems(parsed.data, userId);
      }
      if (parsed.data[0][0] === 'Location') {
        this.importFish(parsed.data, userId);
      }
    });
  }

  private getEntryId(registry: { id: number, name: I18nName }[], name: string): number {
    return registry.find(entry => entry.name.en?.toLowerCase() === name?.toLowerCase())?.id;
  }

  private importItems(data: string[][], userId: string): void {
    this.dataLength = data.length - 1;
    from(data.slice(1))
      .pipe(
        mergeScan((acc, row) => {
          const res$ = new Subject();
          setTimeout(() => {
            this.done++;
            this.cd.detectChanges();
            const itemId = this.getEntryId(this.items, row[0]);
            const source = this.getAllaganReportSource(row[1]);
            if (!itemId || !source) {
              return acc;
            }
            res$.next([...acc, ...row.slice(2).filter(cell => cell)
              .map(cell => {
                return {
                  itemId,
                  source,
                  data: this.cellToData(source, cell),
                  reporter: userId,
                  gt: true
                };
              })
            ]);
            res$.complete();
          }, 1);
          return res$;
        }, []),
        scan((acc, row) => [...acc, ...row], [])
      )
      .subscribe((queue) => {
        if (this.done >= this.dataLength) {
          this.queue = queue;
          this.cd.detectChanges();
        }
      });
  }

  private importFish(data: string[][], userId: string): void {
    this.dataLength = data.length - 1;
    from(data.slice(1))
      .pipe(
        scan((acc, row, index) => {
          this.done++;
          this.cd.detectChanges();
          // If nothing in second cell, it's a spot line
          if (!row[1]) {
            const fishingSpotId = this.getFishingSpotIdByName(row[0]);
            const spearFishingSpotId = this.getSpearFishingSpotIdByName(row[0]);
            // If we have a spot for both using this placename, check next row to see if it's a gig head or a bait
            let spot = fishingSpotId || spearFishingSpotId;
            let source = fishingSpotId ? AllaganReportSource.FISHING : AllaganReportSource.SPEARFISHING;
            if (fishingSpotId && spearFishingSpotId) {
              if (data[index + 2][1].indexOf('Gig') > -1) {
                spot = spearFishingSpotId;
                source = AllaganReportSource.SPEARFISHING;
              } else {
                spot = fishingSpotId;
                source = AllaganReportSource.FISHING;
              }
            }
            if (!fishingSpotId && !spearFishingSpotId) {
              console.warn(`No spot found for place ${row[0]} at row #${this.done + 1}`);
              return acc;
            }
            return {
              ...acc,
              spot,
              source
            };
          } else {
            const report: AllaganReport = {
              itemId: this.getEntryId(this.items, row[0]),
              source: acc.source,
              reporter: userId,
              gt: true,
              data: {}
            };
            if (report.source === AllaganReportSource.FISHING) {
              report.data = pickBy({
                spot: acc.spot,
                hookset: ['powerful', 'precision'].indexOf(row[8].toLowerCase().trim()) + 1,
                tug: ['Medium', 'Heavy', 'Light'].indexOf(row[7]),
                bait: this.getEntryId(this.items, row[1]),
                spawn: row[2] === '' ? null : +row[2],
                duration: row[2] === '' ? null : TimeUtils.getDuration([+row[2], +row[3]]),
                weathers: row[5].trim() === '' ? [] : row[5].split(',').map(weatherName => this.getEntryId(this.weathers, weatherName.trim())),
                weathersFrom: row[4].trim() === '' ? [] : row[4].split(',').map(weatherName => this.getEntryId(this.weathers, weatherName.trim())),
                snagging: +row[10] === 1,
                predators: row[6] === '' ? [] : row[6].split(',').reduce((predators, entry) => {
                  if (isNaN(+entry)) {
                    //if it's not a number, it's a predator name
                    return [...predators, {
                      id: this.getEntryId(this.items, entry),
                      amount: 0
                    }];
                  }
                  return [
                    ...predators.slice(0, -1),
                    {
                      ...predators[predators.length - 1],
                      amount: +entry
                    }
                  ];
                }, [])
              }, value => value !== undefined && value !== null);
            } else if (report.source === AllaganReportSource.SPEARFISHING) {
              report.data = pickBy({
                gig: row[1].replace(' Gig Head', '').trim(),
                predators: row[6] === '' ? [] : row[6].split(',').reduce((predators, entry) => {
                  if (isNaN(+entry)) {
                    //if it's not a number, it's a predator name
                    return [...predators, {
                      id: this.getEntryId(this.items, entry),
                      amount: 0
                    }];
                  }
                  return [
                    ...predators.slice(0, -1),
                    {
                      ...predators[predators.length - 1],
                      amount: +entry
                    }
                  ];
                }, []),
                spawn: row[2] === '' ? null : +row[2],
                duration: row[2] === '' ? null : TimeUtils.getDuration([+row[2], +row[3]])
              }, value => value !== undefined && value !== null);
            }

            if (!report.itemId || (report.source === AllaganReportSource.FISHING && !report.data.bait)
              || (report.source === AllaganReportSource.SPEARFISHING && !report.data.gig)) {
              console.log(index, row, report);
              return acc;
            }
            return {
              ...acc,
              reports: [
                ...acc.reports,
                report
              ]
            };
          }
        }, { spot: -1, source: null, reports: [] }),
        pluck('reports')
      )
      .subscribe((queue) => {
        if (this.done >= this.dataLength) {
          console.log(queue);
          this.queue = queue;
          this.cd.detectChanges();
        }
      });
  }

  getFishingSpotIdByName(name: string): number {
    return this.lazyData.data.fishingSpots.find(spot => {
      return this.lazyData.data.places[spot.zoneId]?.en?.toLowerCase() === name.toLowerCase();
    })?.id;
  }

  getSpearFishingSpotIdByName(name: string): number {
    return this.lazyData.data.spearFishingLog.find(spot => {
      return this.lazyData.data.places[spot.zoneId]?.en?.toLowerCase() === name.toLowerCase();
    })?.id;
  }

  startImport(): void {
    this.allaganReportsService.importFromGT([...this.queue]).subscribe(() => {
      this.message.success('Reports import success');
      this.modalRef.close();
    });
    this.queue = [];
  }

  private getAllaganReportSource(string: string): AllaganReportSource {
    switch (string.toLowerCase()) {
      case 'desynth':
        return AllaganReportSource.DESYNTH;
      case 'reduce':
        return AllaganReportSource.REDUCTION;
      case 'loot':
        return AllaganReportSource.LOOT;
      case 'instance':
        return AllaganReportSource.INSTANCE;
      case 'gardening':
        return AllaganReportSource.GARDENING;
      case 'venture':
        return AllaganReportSource.VENTURE;
      case 'voyage':
        return AllaganReportSource.VOYAGE;
    }
  }

  private cellToData(source: AllaganReportSource, cell: string): Object {
    switch (source) {
      case AllaganReportSource.DESYNTH:
      case AllaganReportSource.REDUCTION:
      case AllaganReportSource.GARDENING:
      case AllaganReportSource.LOOT:
        return { itemId: this.getEntryId(this.items, cell) };
      case AllaganReportSource.INSTANCE:
        return { instanceId: this.getEntryId(this.instances, cell) };
      case AllaganReportSource.VENTURE:
        return { ventureId: this.getEntryId(this.ventures, cell) };
      case AllaganReportSource.DROP:
        return { monsterId: this.getEntryId(this.mobs, cell) };
      case AllaganReportSource.VOYAGE:
        const voyageType = cell.indexOf('Clouds') > -1 ? 0 : 1;
        return {
          voyageId: this.getEntryId([this.airshipVoyages, this.submarineVoyages][voyageType], cell),
          voyageType: voyageType
        };
    }
  }
}
