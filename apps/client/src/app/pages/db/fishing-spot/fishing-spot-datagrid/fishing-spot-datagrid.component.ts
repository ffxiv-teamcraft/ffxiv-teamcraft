import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isNil } from 'lodash';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Datagrid, DatagridColDef } from '../../service/fish-context.service';
import { FishingSpotUtilsService } from '../fishing-spot-utils.service';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe, DecimalPipe } from '@angular/common';

/**
 * Renders a data grid for the fishing spot based on the provided Datagrid input.
 * The concept of "columns" and "rows" our inverted in this view, rows are rendered as columns and columns as rows.
 */
@Component({
    selector: 'app-fishing-spot-datagrid',
    templateUrl: './fishing-spot-datagrid.component.html',
    styleUrls: ['./fishing-spot-datagrid.component.less', '../../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FishingSpotUtilsService],
    standalone: true,
    imports: [NgIf, NzTableModule, NgFor, NgTemplateOutlet, ItemIconComponent, NzToolTipModule, AsyncPipe, DecimalPipe]
})
export class FishingSpotDatagridComponent<T extends string | number = number> {
  public readonly activeFish$ = new BehaviorSubject<number | undefined>(undefined);

  @Output()
  public readonly activeFishChange = new EventEmitter<number | undefined>();

  @Input()
  public rowIconRender?: TemplateRef<DatagridColDef>;

  @Input()
  public colIconRender?: TemplateRef<DatagridColDef>;

  public readonly table$ = new ReplaySubject<Datagrid<T>>();

  constructor(public readonly util: FishingSpotUtilsService, public readonly translate: TranslateService) {
  }

  @Input()
  public set activeFish(value: number | undefined) {
    this.activeFish$.next(!isNil(value) ? value : undefined);
  }

  @Input()
  public set table(value: Datagrid<T>) {
    this.table$.next(value);
  }
}
