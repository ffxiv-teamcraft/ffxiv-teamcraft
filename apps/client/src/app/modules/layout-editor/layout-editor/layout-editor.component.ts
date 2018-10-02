import { Component, OnInit } from '@angular/core';
import { ListLayout } from '../../../core/layout/list-layout';
import { Observable } from 'rxjs';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';

@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.less']
})
export class LayoutEditorComponent implements OnInit {

  selectedLayout$: Observable<ListLayout>;

  allLayouts$: Observable<ListLayout[]>;

  layoutComparator = (layout1, layout2) => layout1 && layout2 ? layout1.$key === layout2.$key : layout1 === layout2;

  constructor(private layoutsFacade: LayoutsFacade) {
    this.selectedLayout$ = this.layoutsFacade.selectedLayout$;
    this.allLayouts$ = this.layoutsFacade.allLayouts$;
    this.layoutsFacade.loadAll();
  }

  addLayout(): void {

  }

  select(layout: ListLayout): void {
    this.layoutsFacade.select(layout);
  }

  ngOnInit() {
  }

}
