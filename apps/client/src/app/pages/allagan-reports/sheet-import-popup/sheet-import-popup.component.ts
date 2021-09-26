import { ChangeDetectorRef, Component } from '@angular/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import * as Papa from 'papaparse';
import { from, Subject, Subscription } from 'rxjs';
import { ReportsManagementComponent } from '../reports-management.component';
import { I18nName } from '../../../model/common/i18n-name';
import { AllaganReportSource } from '../model/allagan-report-source';
import { AllaganReport } from '../model/allagan-report';
import { first, mergeScan, scan } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { AllaganReportsService } from '../allagan-reports.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

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
      const parsed = Papa.parse(content);
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
