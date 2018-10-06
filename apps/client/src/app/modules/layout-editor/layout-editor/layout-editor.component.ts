import { Component } from '@angular/core';
import { ListLayout } from '../../../core/layout/list-layout';
import { Observable } from 'rxjs';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { LayoutRow } from '../../../core/layout/layout-row';
import { LayoutRowOrder } from '../../../core/layout/layout-row-order.enum';

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


  constructor(private layoutsFacade: LayoutsFacade) {
    this.selectedLayout$ = this.layoutsFacade.selectedLayout$;
    this.allLayouts$ = this.layoutsFacade.allLayouts$;
    this.layoutsFacade.loadAll();
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
    layout.rows
      .filter((r, i) => r.index !== i)
      .forEach((r, i) => {
        r.index = i;
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
    layout.rows = layout.rows.filter(r => r.name !== row.name && r.index !== row.index);
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
