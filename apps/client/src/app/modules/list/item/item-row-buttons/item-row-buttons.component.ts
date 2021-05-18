import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemRowMenuElement } from '../../../../model/display/item-row-menu-element';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../settings/settings.service';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Team } from '../../../../model/team/team';
import { PermissionLevel } from '../../../../core/database/permissions/permission-level.enum';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { RotationsFacade } from '../../../rotations/+state/rotations.facade';
import { LazyDataService } from '../../../../core/data/lazy-data.service';
import { IpcService } from '../../../../core/electron/ipc.service';
import { PlatformService } from '../../../../core/tools/platform.service';

@Component({
  selector: 'app-item-row-buttons',
  templateUrl: './item-row-buttons.component.html',
  styleUrls: ['./item-row-buttons.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemRowButtonsComponent extends TeamcraftComponent {

  @Input()
  buttonsCache: { [key: string]: boolean } = {};

  @Input()
  finalItem: boolean;

  @Input()
  itemId: number;

  @Input()
  fallbackItemName: string;

  @Input()
  overlay: boolean;

  @Input()
  isCraft: boolean;

  @Input()
  hasAlarms: boolean;

  _attachedRotationKey$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  @Input()
  set attachedRotation(rotationKey: string) {
    this.rotationsFacade.getRotation(rotationKey);
    this._attachedRotationKey$.next(rotationKey);
    this.cd.detectChanges();
  }

  get attachedRotation(): string {
    return this._attachedRotationKey$.value;
  }

  @Input()
  userId: string;

  @Input()
  loggedIn: string;

  @Input()
  commentBadge: boolean;

  @Input()
  team: Team;

  @Input()
  workingOnIt: string[];

  @Input()
  requiredForFinalCraft: boolean | number;

  @Input()
  permissionLevel: PermissionLevel;

  @Input()
  showLogCompletionButton: boolean;

  @Input()
  missingBooks: number[];

  @Input()
  masterbooks: number[];

  @Output()
  attachRotation = new EventEmitter<void>();

  @Output()
  detachRotation = new EventEmitter<void>();

  @Output()
  openCommentsPopup = new EventEmitter<void>();

  @Output()
  checkMasterbooks = new EventEmitter<number[]>();

  @Output()
  addAllAlarms = new EventEmitter<void>();

  @Output()
  openRequirementsPopup = new EventEmitter<void>();

  @Output()
  openRotationMacroPopup = new EventEmitter<CraftingRotation>();

  @Output()
  showTagInput = new EventEmitter<void>();

  @Output()
  changeAmount = new EventEmitter<void>();

  @Output()
  addToList = new EventEmitter<void>();

  @Output()
  removeItem = new EventEmitter<void>();

  @Output()
  markAsDoneInLog = new EventEmitter<void>();

  @Output()
  assignTeamMember = new EventEmitter<any>();

  @Output()
  setWorkingOnIt = new EventEmitter<string>();

  @Output()
  removeWorkingOnIt = new EventEmitter<string>();

  @Output()
  openMarketboardDialog = new EventEmitter<void>();

  @Input()
  requiredAsHQ: boolean;

  @Output()
  requiredAsHQChange = new EventEmitter<boolean>();

  recipeId$: ReplaySubject<string> = new ReplaySubject<string>();

  recipe$ = this.recipeId$.pipe(
    switchMap(id => this.lazyData.getRecipe(id)),
    tap(() => this.cd.detectChanges())
  );

  @Input()
  set recipeId(id: string) {
    this.recipeId$.next(id);
    this.cd.detectChanges();
  }

  itemRowTypes = ItemRowMenuElement;

  rotation$: Observable<CraftingRotation> = this._attachedRotationKey$.pipe(
    filter(key => !!key),
    switchMap(key => {
      return this.rotationsFacade.allRotations$.pipe(
        map(rotations => {
          return rotations.find(rotation => rotation.$key === key);
        }),
        filter(rotation => rotation !== undefined && !rotation.notFound)
      );
    }),
    tap(() => this.cd.detectChanges())
  );

  notFavoriteCopyMode = this.settings.preferredCopyType === 'classic' ? 'isearch' : 'classic';

  constructor(private messageService: NzMessageService, private translate: TranslateService,
              public settings: SettingsService, private cd: ChangeDetectorRef,
              private rotationsFacade: RotationsFacade, private lazyData: LazyDataService,
              private ipc: IpcService, public platform: PlatformService) {
    super();
    this.settings.settingsChange$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(() => {
      this.cd.detectChanges();
    });
  }

  public isButton(element: ItemRowMenuElement): boolean {
    return this.buttonsCache[element];
  }

  openRotationOverlay(rotation: CraftingRotation): void {
    this.ipc.openOverlay(`/rotation-overlay/${rotation.$key}`, '/rotation-overlay', IpcService.ROTATION_DEFAULT_DIMENSIONS);
  }

  success(key: string, args?: any): void {
    this.messageService.success(this.translate.instant(key, args));
  }

}
