import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-layout-editor-page',
  templateUrl: './layout-editor-page.component.html',
  styleUrls: ['./layout-editor-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutEditorPageComponent {

  public lists$ = this.listsFacade.myLists$.pipe(
    map(lists => {
      return lists.map(l => {
        return {
          name: l.name,
          key: l.$key,
          size: l.finalItems.length
        };
      });
    })
  );

  public selectedListKey$ = this.listsFacade.selectedList$.pipe(
    map(list => list.$key)
  );

  public display$ = this.listsFacade.selectedList$.pipe(
    switchMap(list => {
      return this.layoutsFacade.getDisplay(list, false);
    })
  );

  constructor(private layoutsFacade: LayoutsFacade, private listsFacade: ListsFacade) {
    this.listsFacade.loadMyLists();
  }

  selectList(key: string): void {
    this.listsFacade.select(key);
  }

}
