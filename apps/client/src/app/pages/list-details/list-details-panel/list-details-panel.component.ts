import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { ListRow } from '../../../modules/list/model/list-row';
import { ZoneBreakdownRow } from '../../../model/common/zone-breakdown-row';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nName } from '../../../model/common/i18n-name';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { ZoneBreakdown } from '../../../model/common/zone-breakdown';

@Component({
  selector: 'app-list-details-panel',
  templateUrl: './list-details-panel.component.html',
  styleUrls: ['./list-details-panel.component.less']
})
export class ListDetailsPanelComponent implements OnChanges {

  @Input()
  displayRow: LayoutRowDisplay;

  @Input()
  finalItems = false;

  tiers: ListRow[][];

  zoneBreakdown: ZoneBreakdown;

  constructor(private i18nTools: I18nToolsService, private l12n: LocalizedDataService,
              private message: NzMessageService, private translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.displayRow && this.displayRow.tiers) {
      this.generateTiers();
    }
    if (this.displayRow && this.displayRow.zoneBreakdown) {
      this.zoneBreakdown = new ZoneBreakdown(this.displayRow.rows);
    }
  }

  public generateTiers(): void {
    if (this.displayRow.rows !== null) {
      this.tiers = [[]];
      this.topologicalSort(this.displayRow.rows).forEach(row => {
        this.tiers = this.setTier(row, this.tiers);
      });
    }
  }

  private topologicalSort(data: ListRow[]): ListRow[] {
    const res: ListRow[] = [];
    const doneList: boolean[] = [];
    while (data.length > res.length) {
      let resolved = false;

      for (const item of data) {
        if (res.indexOf(item) > -1) {
          // item already in resultset
          continue;
        }
        resolved = true;

        if (item.requires !== undefined) {
          for (const dep of item.requires) {
            // We have to check if it's not a precraft, as some dependencies aren't resolvable inside the current array.
            const depIsInArray = data.find(row => row.id === dep.id) !== undefined;
            if (!doneList[dep.id] && depIsInArray) {
              // there is a dependency that is not met:
              resolved = false;
              break;
            }
          }
        }
        if (resolved) {
          // All dependencies are met:
          doneList[item.id] = true;
          res.push(item);
        }
      }
    }
    return res;
  }

  private setTier(row: ListRow, result: ListRow[][]): ListRow[][] {
    if (result[0] === undefined) {
      result[0] = [];
    }
    // Default tier is -1, because we want to do +1 to the last requirement tier to define the tier of the current item.
    let requirementsTier = -1;
    for (const requirement of (row.requires || [])) {
      for (let tier = 0; tier < result.length; tier++) {
        if (result[tier].find(r => r.id === requirement.id) !== undefined) {
          requirementsTier = requirementsTier > tier ? requirementsTier : tier;
        }
      }
    }
    const itemTier = requirementsTier + 1;
    if (result[itemTier] === undefined) {
      result[itemTier] = [];
    }
    result[itemTier].push(row);
    return result;
  }

  public getLocation(id: number): I18nName {
    if (id === -1) {
      return { fr: 'Autre', de: 'Anderes', ja: 'Other', en: 'Other' };
    }
    return this.l12n.getPlace(id);
  }

  public getTextExport(): string {
    return this.displayRow.rows.reduce((exportString, row) => {
      return exportString + `${row.amount}x ${this.i18nTools.getName(this.l12n.getItem(row.id))}\n`;
    }, `${this.displayRow.title} :\n`);
  }

  textCopied(): void {
    this.message.success(this.translate.instant('LIST.Copied_as_text'));
  }

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

  trackByTier(index: number, item: ListRow[]) {
    return item.length;
  }

  trackByZone(index: number, item: ZoneBreakdownRow) {
    return item.zoneId;
  }

}
