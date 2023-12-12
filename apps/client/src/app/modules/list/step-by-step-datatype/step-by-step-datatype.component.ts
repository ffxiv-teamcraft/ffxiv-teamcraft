import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DataType } from '@ffxiv-teamcraft/types';
import { ListStep } from '../step-by-step-details/model/map-list-step';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { ListsFacade } from '../+state/lists.facade';
import { observeInput } from '../../../core/rxjs/observe-input';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { NpcBreakdown } from '../../../model/common/npc-breakdown';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { NpcBreakdownRow } from '../../../model/common/npc-breakdown-row';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { TradeIconPipe } from '../../../pipes/pipes/trade-icon.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { StepByStepRowComponent } from '../step-by-step-row/step-by-step-row.component';
import { LazyScrollComponent } from '../../lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { MapPositionComponent } from '../../map/map-position/map-position.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf, NgSwitch, NgSwitchCase, NgFor, AsyncPipe, LowerCasePipe } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-step-by-step-datatype',
    templateUrl: './step-by-step-datatype.component.html',
    styleUrls: ['./step-by-step-datatype.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCardModule, NgIf, NzButtonModule, NzWaveModule, NzToolTipModule, NzPopconfirmModule, NzIconModule, NgSwitch, NgSwitchCase, ItemIconComponent, FlexModule, NgFor, MapPositionComponent, NzDividerModule, LazyScrollComponent, StepByStepRowComponent, AsyncPipe, LowerCasePipe, TranslateModule, NodeTypeIconPipe, XivapiIconPipe, LazyIconPipe, TradeIconPipe, JobUnicodePipe, LazyRowPipe]
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

  firstRelevantSource$ = combineLatest([this.steps$, this.dataType$]).pipe(
    map(([steps, dataType]) => {
      return steps[0].sources.find(source => source.type === dataType);
    })
  );

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
      this.listsFacade.setItemDone({
        itemId: step.row.id,
        itemIcon: step.row.icon,
        finalItem: step.row.finalItem,
        delta: step.row.amount - step.row.done,
        recipeId: step.row.recipeId,
        totalNeeded: step.row.amount
      });
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
