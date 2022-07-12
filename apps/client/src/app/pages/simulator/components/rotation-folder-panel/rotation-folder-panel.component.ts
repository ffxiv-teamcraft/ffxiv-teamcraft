import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CraftingRotationsFolder } from '../../../../model/other/crafting-rotations-folder';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { PermissionLevel } from '../../../../core/database/permissions/permission-level.enum';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../../+state/auth.facade';
import { LinkToolsService } from '../../../../core/tools/link-tools.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { NameQuestionPopupComponent } from '../../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { PermissionsBoxComponent } from '../../../../modules/permissions/permissions-box/permissions-box.component';
import { RotationFoldersFacade } from '../../../../modules/rotation-folders/+state/rotation-folders.facade';
import { TeamcraftUser } from '../../../../model/user/teamcraft-user';
import { CustomLinksFacade } from '../../../../modules/custom-links/+state/custom-links.facade';
import { CustomLink } from '../../../../core/database/custom-links/custom-link';
import { FolderAdditionPickerComponent } from '../../../../modules/folder-addition-picker/folder-addition-picker/folder-addition-picker.component';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { PermissionsController } from '../../../../core/database/permissions-controller';

@Component({
  selector: 'app-rotation-folder-panel',
  templateUrl: './rotation-folder-panel.component.html',
  styleUrls: ['./rotation-folder-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RotationFolderPanelComponent {

  @Input()
  rotations: CraftingRotation[] = [];

  public user$ = this.authFacade.user$;

  public customLink$: Observable<CustomLink>;

  private folder$: ReplaySubject<CraftingRotationsFolder> = new ReplaySubject<CraftingRotationsFolder>();

  permissionLevel$: Observable<PermissionLevel> = combineLatest([this.authFacade.userId$, this.folder$]).pipe(
    map(([userId, folder]) => PermissionsController.getPermissionLevel(folder, userId)),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private syncLinkUrl: string;

  constructor(private foldersFacade: RotationFoldersFacade, private authFacade: AuthFacade, private linkTools: LinkToolsService,
              private message: NzMessageService, private translate: TranslateService, private dialog: NzModalService,
              private customLinksFacade: CustomLinksFacade, private rotationsFacade: RotationsFacade) {

    this.customLink$ = combineLatest([this.customLinksFacade.myCustomLinks$, this.folder$]).pipe(
      map(([links, folder]) => links.find(link => link.redirectTo === `rotation-folder/${folder.$key}`)),
      tap(link => link !== undefined ? this.syncLinkUrl = link.getUrl() : null),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  public _folder: CraftingRotationsFolder;

  @Input()
  public set folder(f: CraftingRotationsFolder) {
    this._folder = new CraftingRotationsFolder();
    Object.assign(this._folder, f);
    this.folder$.next(this._folder);
  }

  addRotations(): void {
    combineLatest([this.rotationsFacade.myRotations$, this.foldersFacade.myRotationFolders$]).pipe(
      first(),
      switchMap(([rotations, folders]) => {
        const elements = rotations
          .filter(rotation => {
            return folders.find(f => f.rotationIds.indexOf(rotation.$key) > -1) === undefined;
          });
        return this.dialog.create({
          nzTitle: this.translate.instant('SIMULATOR.ROTATIONS.FOLDERS.Add_rotations'),
          nzContent: FolderAdditionPickerComponent,
          nzComponentParams: {
            elements: elements.map(rotation => {
              return {
                $key: rotation.$key,
                name: of(rotation.getName())
              };
            })
          },
          nzFooter: null
        }).afterClose;
      })
    ).subscribe(rotations => {
      if (rotations && rotations.length > 0) {
        this._folder.rotationIds.push(...rotations.map(rotation => rotation.$key));
        this.foldersFacade.updateFolder(this._folder);
      }
    });
  }

  createCustomLink(folder: CraftingRotationsFolder, user: TeamcraftUser): void {
    this.customLinksFacade.createCustomLink(folder.name, `rotation-folder/${folder.$key}`, user);
  }

  deleteFolder(): void {
    this.foldersFacade.deleteFolder(this._folder.$key);
  }

  getLink = () => {
    return this.syncLinkUrl ? this.syncLinkUrl : this.linkTools.getLink(`/rotation-folder/${this._folder.$key}`);
  };

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

  onCraftingRotationDrop(event: any): void {
    const index = event.dropIndex;
    const rotation = event.value;
    this._folder.rotationIds = this._folder.rotationIds.filter(key => key !== rotation.$key);
    this._folder.rotationIds.splice(index, 0, rotation.$key);
    this.foldersFacade.updateFolder(this._folder);
  }

  removeCraftingRotation(rotation: CraftingRotation): void {
    this._folder.rotationIds = this._folder.rotationIds.filter(key => key !== rotation.$key);
    this.foldersFacade.updateFolder(this._folder);
  }

  trackByCraftingRotation(index: number, rotation: CraftingRotation): string {
    return rotation && rotation.$key;
  }

}
