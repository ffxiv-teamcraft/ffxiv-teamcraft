import { Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, ReplaySubject } from 'rxjs';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-list-panel-overlay',
  templateUrl: './list-panel-overlay.component.html',
  styleUrls: ['./list-panel-overlay.component.less']
})
export class ListPanelOverlayComponent {

  public hideCompleted$ = new BehaviorSubject<boolean>(this.settings.hideOverlayCompleted);

  public display$ = combineLatest([this.listsFacade.selectedList$, this.hideCompleted$]).pipe(
    switchMap(([list, hideCompletedOverride]) => {
      return combineLatest([
        this.layoutsFacade.getDisplay(list, false, hideCompletedOverride),
        this.layoutsFacade.getFinalItemsDisplay(list, false)
      ]);
    }),
    map(([display, finalRow]) => ([...display.rows, finalRow])),
    shareReplay(1)
  );

  public selectedPanel$ = new ReplaySubject<string>();

  public selectedPanelDisplay$ = combineLatest([this.display$, this.selectedPanel$]).pipe(
    map(([display, selectedPanel]) => {
      return display.find(row => row.title === selectedPanel);
    })
  );

  constructor(private ipc: IpcService, private listsFacade: ListsFacade,
              private layoutsFacade: LayoutsFacade, private settings: SettingsService) {
    this.ipc.mainWindowState$.pipe(
      filter(state => {
        return state.lists && state.lists.selectedId && state.layouts;
      })
    ).subscribe((state) => {
      this.listsFacade.overlayListsLoaded(state.lists.listDetails);
      this.listsFacade.select(state.lists.selectedId);
      this.layoutsFacade.selectFromOverlay(state.layouts.selectedKey);
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
