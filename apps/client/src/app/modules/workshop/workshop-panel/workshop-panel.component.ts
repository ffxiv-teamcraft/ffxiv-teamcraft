import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Workshop } from '../../../model/other/workshop';
import { combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { WorkshopsFacade } from '../+state/workshops.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { List } from '../../list/model/list';
import { PermissionsBoxComponent } from '../../permissions/permissions-box/permissions-box.component';
import { ListsFacade } from '../../list/+state/lists.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { CustomLinksFacade } from '../../custom-links/+state/custom-links.facade';
import { CustomLink } from '../../../core/database/custom-links/custom-link';
import { ListPickerService } from '../../list-picker/list-picker.service';
import { FolderAdditionPickerComponent } from '../../folder-addition-picker/folder-addition-picker/folder-addition-picker.component';
import { PermissionsController } from '../../../core/database/permissions-controller';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ListPanelComponent } from '../../list/list-panel/list-panel.component';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

@Component({
    selector: 'app-workshop-panel',
    templateUrl: './workshop-panel.component.html',
    styleUrls: ['./workshop-panel.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCollapseModule, CdkDropList, FlexModule, NgFor, CdkDrag, ListPanelComponent, NzGridModule, NzButtonModule, NzWaveModule, NzToolTipModule, ClipboardDirective, NzIconModule, NgIf, RouterLink, NzPopconfirmModule, NzDropDownModule, NzMenuModule, AsyncPipe, TranslateModule]
})
export class WorkshopPanelComponent {

  public aggregatedIds: string;

  private _lists: List[];
  @Input()
  set lists(lists: List[]) {
    this._lists = lists;
    this.aggregatedIds = lists.map(l => l.$key).join(':');
  }

  get lists(): List[] {
    return this._lists;
  }


  public user$ = this.authFacade.user$;

  public customLink$: Observable<CustomLink>;

  private workshop$: ReplaySubject<Workshop> = new ReplaySubject<Workshop>();

  permissionLevel$: Observable<PermissionLevel> = combineLatest([this.authFacade.userId$, this.workshop$]).pipe(
    map(([userId, workshop]) => PermissionsController.getPermissionLevel(workshop, userId)),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private syncLinkUrl: string;

  constructor(private workshopsFacade: WorkshopsFacade, private authFacade: AuthFacade, private linkTools: LinkToolsService,
              private message: NzMessageService, private translate: TranslateService, private dialog: NzModalService,
              private listsFacade: ListsFacade, private customLinksFacade: CustomLinksFacade,
              private listPicker: ListPickerService) {
    this.customLink$ = combineLatest([this.customLinksFacade.myCustomLinks$, this.workshop$]).pipe(
      map(([links, workshop]) => links.find(link => link.redirectTo === `workshop/${workshop.$key}`)),
      tap(link => link !== undefined ? this.syncLinkUrl = link.getUrl() : null),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  public _workshop: Workshop;

  @Input()
  public set workshop(l: Workshop) {
    this._workshop = l;
    this.workshop$.next(l);
  }

  addList(): void {
    this.listPicker.pickList(true).subscribe(list => {
      this._workshop.listIds.push(list.$key);
      this.workshopsFacade.updateWorkshop(this._workshop);
    });
  }

  addLists(): void {
    combineLatest([this.listsFacade.myLists$, this.workshopsFacade.myWorkshops$]).pipe(
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
                name: of(list.name),
                description: list.note
              };
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

  deleteWorkshop(): void {
    this.workshopsFacade.deleteWorkshop(this._workshop.$key);
  }

  getLink = () => {
    return this.syncLinkUrl ? this.syncLinkUrl : this.linkTools.getLink(`/workshop/${this._workshop.$key}`);
  };

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
      nzComponentParams: {
        data: this._workshop,
        ready$: modalReady$,
        enablePropagation: true
      }
    });
    modalReady$.pipe(
      first(),
      switchMap(() => {
        return modalRef.getContentComponent().changes$;
      })
    ).subscribe((updatedWorkshop: Workshop) => {
      this.workshopsFacade.updateWorkshop(updatedWorkshop);
    });
  }

  onListDrop(list: List, index: number): void {
    this._workshop.listIds = this._workshop.listIds.filter(key => key !== list.$key);
    this._workshop.listIds.splice(index, 0, list.$key);
    this.workshopsFacade.updateWorkshop(this._workshop);
    this.listsFacade.pureUpdateList(list.$key, {
      workshopId: this._workshop.$key
    });
  }

  removeList(list: List): void {
    this._workshop.listIds = this._workshop.listIds.filter(key => key !== list.$key);
    this.workshopsFacade.updateWorkshop(this._workshop);
  }

  trackByList(index: number, list: List): string {
    return list.$key;
  }
}
