import { Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, ReplaySubject } from 'rxjs';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { SettingsService } from '../../../modules/settings/settings.service';
import { List } from '../../../modules/list/model/list';
import { TranslateModule } from '@ngx-translate/core';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { ListDetailsPanelComponent } from '../../../modules/list/list-details-panel/list-details-panel.component';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { OverlayContainerComponent } from '../../../modules/overlay-container/overlay-container/overlay-container.component';

@Component({
    selector: 'app-list-panel-overlay',
    templateUrl: './list-panel-overlay.component.html',
    styleUrls: ['./list-panel-overlay.component.less'],
    standalone: true,
    imports: [OverlayContainerComponent, NgIf, FlexModule, NgFor, NzButtonModule, NzWaveModule, NzCheckboxModule, FormsModule, ListDetailsPanelComponent, FullpageMessageComponent, AsyncPipe, TranslateModule]
})
export class ListPanelOverlayComponent {

  public hideCompleted$ = new BehaviorSubject<boolean>(this.settings.hideOverlayCompleted);

  public display$ = combineLatest([this.listsFacade.selectedList$, this.hideCompleted$]).pipe(
    switchMap(([list, hideCompletedOverride]) => {
      return combineLatest([
        this.layoutsFacade.getDisplay(list, false, hideCompletedOverride),
        this.layoutsFacade.getFinalItemsDisplay(list, false, hideCompletedOverride)
      ]);
    }),
    map(([display, finalRow]) => ([...display.rows, finalRow])),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public selectedPanel$ = new ReplaySubject<string>();

  public selectedPanelDisplay$ = combineLatest([this.display$, this.selectedPanel$]).pipe(
    map(([display, selectedPanel]) => {
      return display.find(row => row.title === selectedPanel);
    })
  );

  constructor(private ipc: IpcService, private listsFacade: ListsFacade,
              private layoutsFacade: LayoutsFacade, private settings: SettingsService) {
    this.layoutsFacade.loadAll();
    this.ipc.mainWindowState$.pipe(
      filter(state => {
        return state.lists && state.lists.selectedId && state.layouts;
      })
    ).subscribe((state) => {
      this.listsFacade.overlayListsLoaded(Object.values<List>(state.lists.listDetails.entities).filter(list => list.$key === state.lists.selectedId));
      this.listsFacade.select(state.lists.selectedId);
      this.layoutsFacade.selectFromOverlay(state.layouts.selectedId);
    });
  }

  hideCompletedChange(newValue: boolean): void {
    this.settings.hideOverlayCompleted = newValue;
    this.hideCompleted$.next(newValue);
  }

  trackByPanel(index: number, panel: LayoutRowDisplay): string {
    return panel.title;
  }

}
