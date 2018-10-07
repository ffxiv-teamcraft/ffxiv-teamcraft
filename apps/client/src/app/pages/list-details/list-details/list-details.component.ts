import { Component, OnInit } from '@angular/core';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, first, map, mergeMap, shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { List } from '../../../modules/list/model/list';
import { ListRow } from '../../../modules/list/model/list-row';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { LayoutEditorComponent } from '../../../modules/layout-editor/layout-editor/layout-editor.component';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { TagsPopupComponent } from '../../../modules/list/tags-popup/tags-popup.component';

@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.component.html',
  styleUrls: ['./list-details.component.less']
})
export class ListDetailsComponent implements OnInit {

  public display$: Observable<LayoutRowDisplay[]>;

  public finalItemsRow$: Observable<LayoutRowDisplay>;

  public list$: Observable<List>;

  public crystals$: Observable<ListRow[]>;

  constructor(private layoutsFacade: LayoutsFacade, private listsFacade: ListsFacade,
              private activatedRoute: ActivatedRoute, private dialog: NzModalService,
              private translate: TranslateService, private router: Router,
              private alarmsFacade: AlarmsFacade, private message: NzMessageService,
              private listManager: ListManagerService, private progressService: ProgressPopupService) {
    this.list$ = this.listsFacade.selectedList$.pipe(
      filter(list => list !== undefined),
      shareReplay(1)
    );
    this.finalItemsRow$ = this.list$.pipe(
      mergeMap(list => this.layoutsFacade.getFinalItemsDisplay(list))
    );
    this.display$ = this.list$.pipe(
      mergeMap(list => this.layoutsFacade.getDisplay(list)),
    );
    this.crystals$ = this.list$.pipe(
      map(list => list.crystals)
    );
  }

  ngOnInit() {
    this.layoutsFacade.loadAll();
    this.activatedRoute.paramMap
      .pipe(
        map(params => params.get('listId')),
        tap((listId: string) => this.listsFacade.load(listId))
      )
      .subscribe(listId => {
        this.listsFacade.select(listId);
      });
  }

  renameList(list: List): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        list.name = name;
        return list;
      })
    ).subscribe(l => this.listsFacade.updateList(l));
  }

  createAlarms(list: List): void {
    this.alarmsFacade.allAlarms$.pipe(
      first(),
      map(alarms => {
        const listAlarms = [];
        list.forEach(row => listAlarms.push(...row.alarms.filter(alarm => {
          // Avoid duplicates.
          return listAlarms.find(a => a.itemId === alarm.itemId && a.zoneId === alarm.zoneId) === undefined;
        })));
        return listAlarms.filter(alarm => {
          return alarms.find(a => a.itemId === alarm.itemId && a.zoneId === alarm.zoneId) === undefined;
        });
      })
    ).subscribe(alarms => {
      this.alarmsFacade.addAlarms(...alarms);
    });
  }

  cloneList(list: List): void {
    const clone = list.clone();
    this.listsFacade.updateList(list);
    this.listsFacade.addList(clone);
    this.listsFacade.myLists$.pipe(
      map(lists => lists.find(l => l.createdAt === clone.createdAt && l.$key !== undefined)),
      filter(l => l !== undefined),
      first()
    ).subscribe(l => {
      this.router.navigate(['list', l.$key]);
      this.message.success(this.translate.instant('List_forked'));
    });
  }

  regenerateList(list: List): void {
    this.progressService.showProgress(this.listManager.upgradeList(list), 1, 'List_popup_title')
      .pipe(first())
      .subscribe((updatedList) => {
        this.listsFacade.updateList(updatedList);
      });
  }

  openLayoutOptions(): void {
    this.dialog.create({
      nzFooter: null,
      nzContent: LayoutEditorComponent
    });
  }

  openTagsPopup(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Tags_popup'),
      nzFooter: null,
      nzContent: TagsPopupComponent,
      nzComponentParams: { list: list }
    });
  }

  trackByDisplayRow(index: number, row: LayoutRowDisplay): string {
    return row.filterChain + row.title;
  }

}
