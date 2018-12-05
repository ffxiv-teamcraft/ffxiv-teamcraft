import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CraftingRotationsFolder } from '../../../model/other/crafting-rotations-folder';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { combineLatest, Observable, ReplaySubject, Subject } from 'rxjs';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { PermissionsBoxComponent } from '../../permissions/permissions-box/permissions-box.component';
import { RotationFoldersFacade } from '../+state/rotation-folders.facade';
import { RotationsFacade } from '../../rotations/+state/rotations.facade';

@Component({
  selector: 'app-rotation-folder-panel',
  templateUrl: './rotation-folder-panel.component.html',
  styleUrls: ['./rotation-folder-panel.component.less']
})
export class RotationFolderPanelComponent implements OnChanges {

  @Input()
  public set folder(l: CraftingRotationsFolder) {
    this._folder = l;
    this.folder$.next(l);
  }

  public _folder: CraftingRotationsFolder;

  private folder$: ReplaySubject<CraftingRotationsFolder> = new ReplaySubject<CraftingRotationsFolder>();

  @Input()
  rotations: CraftingRotation[] = [];

  permissionLevel$: Observable<PermissionLevel> = combineLatest(this.authFacade.userId$, this.folder$).pipe(
    map(([userId, folder]) => folder.getPermissionLevel(userId)),
    distinctUntilChanged(),
    shareReplay(1)
  );

  constructor(private foldersFacade: RotationFoldersFacade, private authFacade: AuthFacade, private linkTools: LinkToolsService,
              private message: NzMessageService, private translate: TranslateService, private dialog: NzModalService,
              private rotationsFacade: RotationsFacade) {
  }

  deleteFolder(): void {
    this.foldersFacade.deleteFolder(this._folder.$key);
  }

  getLink(): string {
    return this.linkTools.getLink(`/rotation-folder/${this._folder.$key}`);
  }

  renameFolder(): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: this._folder.name },
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        this._folder.name = name;
        return this._folder;
      })
    ).subscribe(folder => this.foldersFacade.updateFolder(folder));
  }

  openPermissionsPopup(): void {
    const modalReady$ = new Subject<void>();
    const modalRef = this.dialog.create({
      nzTitle: this.translate.instant('PERMISSIONS.Title'),
      nzFooter: null,
      nzContent: PermissionsBoxComponent,
      nzComponentParams: { data: this._folder, ready$: modalReady$ }
    });
    modalReady$.pipe(
      first(),
      switchMap(() => {
        return modalRef.getContentComponent().changes$;
      })
    ).subscribe((updatedCraftingRotationsFolder: CraftingRotationsFolder) => {
      this.foldersFacade.updateFolder(updatedCraftingRotationsFolder);
    });
  }

  onCraftingRotationDrop(rotation: CraftingRotation, index: number): void {
    this._folder.rotationIds = this._folder.rotationIds.filter(key => key !== rotation.$key);
    this._folder.rotationIds.splice(index, 0, rotation.$key);
    this.foldersFacade.updateFolder(this._folder);
  }

  removeCraftingRotation(rotation: CraftingRotation): void {
    this._folder.rotationIds = this._folder.rotationIds.filter(key => key !== rotation.$key);
    this.foldersFacade.updateFolder(this._folder);
  }

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('SIMULATOR.ROTATIONS.FOLDERS.Share_link_copied'));
  }

  trackByCraftingRotation(index: number, rotation: CraftingRotation): string {
    return rotation.$key;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Filter the rotations we are missing and we need to load
    this._folder.rotationIds.filter(id => this.rotations.find(l => l.$key === id) === undefined)
      .forEach((missingRotation) => {
        this.rotationsFacade.getRotation(missingRotation);
      });
  }

}
