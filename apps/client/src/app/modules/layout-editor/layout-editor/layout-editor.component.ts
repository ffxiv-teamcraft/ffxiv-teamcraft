import { Component } from '@angular/core';
import { ListLayout } from '../../../core/layout/list-layout';
import { Observable } from 'rxjs';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { LayoutRow } from '../../../core/layout/layout-row';
import { LayoutRowOrder } from '../../../core/layout/layout-row-order.enum';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { TextQuestionPopupComponent } from '../../text-question-popup/text-question-popup/text-question-popup.component';
import { filter } from 'rxjs/operators';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { LayoutRowDisplayEditorComponent } from '../layout-row-display-editor/layout-row-display-editor.component';
import { LayoutOrderPopupComponent } from '../layout-order-popup/layout-order-popup.component';

@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.less']
})
export class LayoutEditorComponent {

  selectedLayout$: Observable<ListLayout>;

  allLayouts$: Observable<ListLayout[]>;

  dirty = false;

  constructor(private layoutsFacade: LayoutsFacade, private message: NzMessageService, private translate: TranslateService,
              private dialog: NzModalService, private serializer: NgSerializerService) {
    this.selectedLayout$ = this.layoutsFacade.selectedLayout$;
    this.allLayouts$ = this.layoutsFacade.allLayouts$;
    this.layoutsFacade.loadAll();
  }

  layoutComparator = (layout1, layout2) => layout1 && layout2 ? layout1.$key === layout2.$key : layout1 === layout2;

  openReorderPopup(layout: ListLayout): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.LAYOUT_DIALOG.Reorder_panels'),
      nzContent: LayoutOrderPopupComponent,
      nzComponentParams: {
        layout: layout
      },
      nzFooter: null
    }).afterClose
      .subscribe(() => {
        this.save(layout);
      });
  }

  importLayout(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.LAYOUT_DIALOG.Import_string'),
      nzContent: TextQuestionPopupComponent,
      nzFooter: null
    }).afterClose
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe((data: string) => {
        const layoutContent = JSON.parse(unescape(atob(data)));
        this.layoutsFacade.createNewLayout('Imported layout', this.serializer.deserialize<ListLayout>(layoutContent, ListLayout));
      });
  }

  getItemsLayoutType(layout: ListLayout): string {
    if (layout.recipeZoneBreakdown) {
      return 'zoneBreakdown';
    }
    return 'default';
  }

  setItemsLayoutType(layout: ListLayout, type: string): void {
    layout.recipeZoneBreakdown = type === 'zoneBreakdown';
    this.dirty = true;
  }

  addLayout(): void {
    this.layoutsFacade.createNewLayout();
  }

  deleteLayout(key: string): void {
    this.layoutsFacade.deleteLayout(key);
  }

  select(layout: ListLayout): void {
    this.layoutsFacade.select(layout);
  }

  addPanel(layout: ListLayout): void {
    layout.rows.unshift(new LayoutRow('New layout row', 'NAME', LayoutRowOrder.DESC, 'NONE', layout.rows.length));
    this.dirty = true;
  }

  removePanel(layout: ListLayout, row: LayoutRow): void {
    layout.rows = layout.rows.filter(r => r.name !== row.name || r.filterName !== row.filterName);
    this.dirty = true;
  }

  updatePanel(layout: ListLayout, row: LayoutRow): void {
    layout.rows = layout.rows.map(r => r.name === row.name ? row : r);
    this.dirty = true;
  }

  editRowButtons(layout: ListLayout): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.LAYOUT_DIALOG.Edit_row_buttons_display'),
      nzContent: LayoutRowDisplayEditorComponent,
      nzComponentParams: {
        layout: layout
      },
      nzFooter: null
    }).afterClose
      .subscribe(() => {
        this.dirty = true;
      });
  }

  save(layout: ListLayout): void {
    this.layoutsFacade.updateLayout(layout);
    this.dirty = false;
  }

  trackByRow(index: number, row: LayoutRow): string {
    return row.filter ? row.filter.name : row.name;
  }

}
