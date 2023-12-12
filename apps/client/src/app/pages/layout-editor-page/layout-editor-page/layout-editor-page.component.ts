import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { LayoutEditorComponent } from '../../../modules/layout-editor/layout-editor/layout-editor.component';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-layout-editor-page',
    templateUrl: './layout-editor-page.component.html',
    styleUrls: ['./layout-editor-page.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, LayoutEditorComponent, NzSelectModule, FormsModule, NgFor, NgIf, NzCollapseModule, NzTagModule, ItemIconComponent, I18nNameComponent, FullpageMessageComponent, AsyncPipe, TranslateModule]
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
    }),
    filter(lists => lists.length > 0),
    first()
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
