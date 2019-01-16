import { Component } from '@angular/core';
import { ListLayout } from '../../../core/layout/list-layout';
import { Observable } from 'rxjs';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { LayoutRow } from '../../../core/layout/layout-row';
import { LayoutRowOrder } from '../../../core/layout/layout-row-order.enum';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { TextQuestionPopupComponent } from '../../text-question-popup/text-question-popup/text-question-popup.component';
import { filter } from 'rxjs/operators';
import { NgSerializerService } from '@kaiu/ng-serializer';

@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.less']
})
export class LayoutEditorComponent {

  selectedLayout$: Observable<ListLayout>;

  allLayouts$: Observable<ListLayout[]>;

  dirty = false;

  layoutComparator = (layout1, layout2) => layout1 && layout2 ? layout1.$key === layout2.$key : layout1 === layout2;

  constructor(private layoutsFacade: LayoutsFacade, private message: NzMessageService, private translate: TranslateService,
              private dialog: NzModalService, private serializer: NgSerializerService) {
    this.selectedLayout$ = this.layoutsFacade.selectedLayout$;
    this.allLayouts$ = this.layoutsFacade.allLayouts$;
    this.layoutsFacade.loadAll();
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
        const layoutContent = JSON.parse(atob(data));
        this.layoutsFacade.createNewLayout('Imported layout', this.serializer.deserialize<ListLayout>(layoutContent, ListLayout));
      });
  }

  layoutCopied(): void {
    this.message.success(this.translate.instant('LIST_DETAILS.LAYOUT_DIALOG.Import_string_copied'));
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

  moveRow(row: LayoutRow, index: number, layout: ListLayout): void {
    // Remove list from the array
    layout.rows = layout.rows.filter(r => r.filterName !== row.filterName && r.name !== row.name);
    // Insert it at new index
    layout.rows.splice(index, 0, row);
    // Update indexes and persist
    layout.rows = layout.rows
      .map((r, i) => {
        r.index = i;
        return r;
      });
    this.dirty = true;
  }

  deleteLayout(key: string): void {
    this.layoutsFacade.deleteLayout(key);
  }

  select(layout: ListLayout): void {
    this.layoutsFacade.select(layout);
  }

  addPanel(layout: ListLayout): void {
    layout.rows.push(new LayoutRow('', 'NAME', LayoutRowOrder.DESC, 'NONE', layout.rows.length));
    this.dirty = true;
  }

  removePanel(layout: ListLayout, row: LayoutRow): void {
    layout.rows = layout.rows.filter(r => r.name !== row.name && r.filterName !== row.filterName);
    this.dirty = true;
  }

  updatePanel(layout: ListLayout, row: LayoutRow): void {
    layout.rows = layout.rows.map(r => r.name === row.name ? row : r);
    this.dirty = true;
  }

  save(layout: ListLayout): void {
    this.layoutsFacade.updateLayout(layout);
    this.dirty = false;
  }

  trackByRow(index: number, row: LayoutRow): string {
    return row.filter.name;
  }

}
