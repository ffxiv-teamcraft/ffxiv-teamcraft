import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DataType } from '../data/data-type';
import { ListStep } from '../step-by-step-details/model/map-list-step';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { ListsFacade } from '../+state/lists.facade';
import { observeInput } from '../../../core/rxjs/observe-input';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { NpcBreakdown } from '../../../model/common/npc-breakdown';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { NpcBreakdownRow } from '../../../model/common/npc-breakdown-row';

@Component({
  selector: 'app-step-by-step-datatype',
  templateUrl: './step-by-step-datatype.component.html',
  styleUrls: ['./step-by-step-datatype.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepByStepDatatypeComponent {
  DataType = DataType;

  @Input()
  dataType: DataType | null; // null is for others

  @Input()
  steps: ListStep[];

  @Input()
  permissionLevel: PermissionLevel;

  dataType$ = observeInput(this, 'dataType');

  steps$ = observeInput(this, 'steps');

  npcBreakdownRows$ = combineLatest([this.dataType$, this.steps$]).pipe(
    filter(([dataType]) => [DataType.VENDORS, DataType.TRADE_SOURCES].includes(dataType)),
    map(([, steps]) => {
      return new NpcBreakdown(steps.map(step => {
        return {
          ...step.row,
          sources: step.sources
        };
      }), this.lazyData, true);
    }),
    switchMap(breakdown => {
      return breakdown.rows$.pipe(
        switchMap(rows => {
          return safeCombineLatest(rows.map(row => {
            return this.getNpcName(row.npcId).pipe(
              map(npc => {
                row.npcName = npc;
                return row;
              })
            );
          }));
        })
      );
    })
  );

  constructor(private listsFacade: ListsFacade, private lazyData: LazyDataFacade,
              private i18n: I18nToolsService) {
  }

  public getNpcName(id: number): Observable<string> {
    if (id === -1) {
      return of({ fr: 'Autre', de: 'Anderes', ja: 'Other', en: 'Other', zh: '其他', ko: '기타' }).pipe(
        map(i18nName => this.i18n.getName(i18nName))
      );
    }
    return this.i18n.getNameObservable('npcs', id);
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }

  trackByNpc(index: number, item: NpcBreakdownRow): number {
    return item.npcId;
  }

  markPanelAsDone(): void {
    this.steps = this.steps.map(step => {
      this.listsFacade.setItemDone(step.row.id, step.row.icon, step.row.finalItem, step.row.amount - step.row.done, step.row.recipeId, step.row.amount);
      return {
        ...step,
        row: {
          ...step.row,
          done: step.row.amount
        }
      };
    });
  }
}
