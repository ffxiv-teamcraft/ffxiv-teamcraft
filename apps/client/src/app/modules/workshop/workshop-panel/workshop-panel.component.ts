import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Workshop } from '../../../model/other/workshop';
import { combineLatest, Observable, ReplaySubject, Subject } from 'rxjs';
import { WorkshopsFacade } from '../+state/workshops.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { List } from '../../list/model/list';
import { PermissionsBoxComponent } from '../../permissions/permissions-box/permissions-box.component';
import { ListsFacade } from '../../list/+state/lists.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { CustomLinksFacade } from '../../custom-links/+state/custom-links.facade';
import { CustomLink } from '../../../core/database/custom-links/custom-link';
import { ListPickerService } from '../../list-picker/list-picker.service';
import { FolderAdditionPickerComponent } from '../../folder-addition-picker/folder-addition-picker/folder-addition-picker.component';

@Component({
  selector: 'app-workshop-panel',
  templateUrl: './workshop-panel.component.html',
  styleUrls: ['./workshop-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkshopPanelComponent implements OnChanges {

  @Input()
  public set workshop(l: Workshop) {
    this._workshop = l;
    this.workshop$.next(l);
  }

  public _workshop: Workshop;

  private workshop$: ReplaySubject<Workshop> = new ReplaySubject<Workshop>();

  @Input()
  lists: List[] = [];

  permissionLevel$: Observable<PermissionLevel> = combineLatest([this.authFacade.userId$, this.workshop$]).pipe(
    map(([userId, workshop]) => workshop.getPermissionLevel(userId)),
    distinctUntilChanged(),
    shareReplay(1)
  );

  public user$ = this.authFacade.user$;

  public customLink$: Observable<CustomLink>;

  private syncLinkUrl: string;

  constructor(private workshopsFacade: WorkshopsFacade, private authFacade: AuthFacade, private linkTools: LinkToolsService,
              private message: NzMessageService, private translate: TranslateService, private dialog: NzModalService,
              private listsFacade: ListsFacade, private customLinksFacade: CustomLinksFacade,
              private listPicker: ListPickerService) {
    this.customLink$ = combineLatest(this.customLinksFacade.myCustomLinks$, this.workshop$).pipe(
      map(([links, workshop]) => links.find(link => link.redirectTo === `workshop/${workshop.$key}`)),
      tap(link => link !== undefined ? this.syncLinkUrl = link.getUrl() : null),
      shareReplay(1)
    );
  }

  addList(): void {
    this.listPicker.pickList(true).subscribe(list => {
      this._workshop.listIds.push(list.$key);
      this.workshopsFacade.updateWorkshop(this._workshop);
    });
  }

  addLists(): void {
    combineLatest(this.listsFacade.myLists$, this.workshopsFacade.myWorkshops$).pipe(
      first(),
      switchMap(([lists, workshops]) => {
        const elements = lists
          .filter(l => {
            return workshops.find(w => w.listIds.indexOf(l.$key) > -1) === undefined && l.name !== undefined && l.name.length > 0;
          });
        return this.dialog.create({
          nzTitle: this.translate.instant('WORKSHOP.Add_lists'),
          nzContent: FolderAdditionPickerComponent,
          nzComponentParams: {
            elements: elements.map(list => {
              return {
                $key: list.$key,
                name: list.name,
                description: list.note
              }
            })
          },
          nzFooter: null
        }).afterClose;
      })
    ).subscribe(lists => {
      if (lists && lists.length > 0) {
        this._workshop.listIds.push(...lists.map(list => list.$key));
        this.workshopsFacade.updateWorkshop(this._workshop);
      }
    });
  }

  createCustomLink(workshop: Workshop, user: TeamcraftUser): void {
    this.customLinksFacade.createCustomLink(workshop.name, `workshop/${workshop.$key}`, user);
  }

  afterCustomLinkCopy(): void {
    this.message.success(this.translate.instant('CUSTOM_LINKS.Share_link_copied'));
  }

  deleteWorkshop(): void {
    this.workshopsFacade.deleteWorkshop(this._workshop.$key);
  }

  getLink(): string {
    return this.syncLinkUrl ? this.syncLinkUrl : this.linkTools.getLink(`/workshop/${this._workshop.$key}`);
  }

  renameWorkshop(): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: this._workshop.name },
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        this._workshop.name = name;
        return this._workshop;
      })
    ).subscribe(workshop => this.workshopsFacade.updateWorkshop(workshop));
  }

  openPermissionsPopup(): void {
    const modalReady$ = new Subject<void>();
    const modalRef = this.dialog.create({
      nzTitle: this.translate.instant('PERMISSIONS.Title'),
      nzFooter: null,
      nzContent: PermissionsBoxComponent,
      nzComponentParams: { data: this._workshop, ready$: modalReady$, enablePropagation: true }
    });
    modalReady$.pipe(
      first(),
      switchMap(() => {
        return modalRef.getContentComponent().changes$;
      })
    ).subscribe((updatedWorkshop: Workshop) => {
      this.workshopsFacade.updateWorkshop(updatedWorkshop);
    });

    modalReady$.pipe(
      first(),
      switchMap(() => {
        return modalRef.getContentComponent().propagateChanges$;
      }),
      switchMap((workshop: Workshop) => {
        return combineLatest(workshop.listIds.map(key => this.listsFacade.loadAndWait(key)))
          .pipe(
            first(),
            withLatestFrom(this.authFacade.userId$),
            map(([lists, userId]) => {
              return lists
                .filter(list => {
                  return list.getPermissionLevel(userId) >= 40;
                })
                .map(list => {
                  list.mergePermissions(workshop, true);
                  return list;
                });
            })
          );
      })
    ).subscribe((updatedLists: List[]) => {
      updatedLists.forEach(list => {
        this.listsFacade.updateList(list, true);
      });
      this.message.success(this.translate.instant('PERMISSIONS.Propagate_changes_done'));
    });
  }

  onListDrop(list: List, index: number): void {
    this._workshop.listIds = this._workshop.listIds.filter(key => key !== list.$key);
    this._workshop.listIds.splice(index, 0, list.$key);
    this.workshopsFacade.updateWorkshop(this._workshop);
  }

  removeList(list: List): void {
    this._workshop.listIds = this._workshop.listIds.filter(key => key !== list.$key);
    this.workshopsFacade.updateWorkshop(this._workshop);
  }

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('WORKSHOP.Share_link_copied'));
  }

  trackByList(index: number, list: List): string {
    return list.$key;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Filter the lists we are missing and we need to load
    this._workshop.listIds.filter(id => this.lists.find(l => l.$key === id) === undefined)
      .forEach((missingCompact) => {
        this.listsFacade.loadCompact(missingCompact);
      });
  }
}
