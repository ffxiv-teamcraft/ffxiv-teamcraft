import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyDataWithExtracts } from '@ffxiv-teamcraft/types';
import { ModificationEntry } from '../../../modules/list/model/modification-entry';
import { CharacterNamePipe } from '../../../pipes/pipes/character-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-list-contributions',
    templateUrl: './list-contributions.component.html',
    styleUrls: ['./list-contributions.component.less'],
    standalone: true,
    imports: [NgIf, NzTableModule, NgFor, AsyncPipe, DecimalPipe, TranslateModule, CharacterNamePipe]
})
export class ListContributionsComponent {

  private sort$ = new BehaviorSubject({
    key: 'amount',
    value: 'ascend'
  });

  stats$ = combineLatest([
    this.lazyData.getEntry('ilvls'),
    this.listsFacade.selectedListModificationHistory$
  ]).pipe(
    map(([ilvls, history]) => this.getContributionStats(history, ilvls))
  );

  public contributions$ = combineLatest([
    this.sort$,
    this.stats$
  ]).pipe(
    map(([sort, stats]) => {
      stats.entries.sort((a, b) => {
        return sort.value === 'ascend' ? a[sort.key] - b[sort.key] : b[sort.key] - a[sort.key];
      });
      return stats;
    })
  );

  constructor(private listsFacade: ListsFacade, private lazyData: LazyDataFacade) {
  }


  private getContributionStats(entries: ModificationEntry[], ilvls: LazyDataWithExtracts['ilvls']) {
    return entries.filter(entry => entry.amount > 0)
      .reduce((stats, entry) => {
        let statsRow = stats.entries.find(s => s.userId === entry.userId);
        if (statsRow === undefined) {
          stats.entries.push({
            userId: entry.userId,
            amount: 0,
            ilvlAmount: 0
          });
          statsRow = stats.entries[stats.entries.length - 1];
        }
        statsRow.amount += entry.amount;
        stats.total += entry.amount;
        statsRow.ilvlAmount += entry.amount * ilvls[entry.itemId];
        stats.ilvlTotal += entry.amount * ilvls[entry.itemId];
        return stats;
      }, { entries: [], total: 0, ilvlTotal: 0 });
  }

  public sort(event: { key: string, value: string }): void {
    this.sort$.next(event);
  }

}
