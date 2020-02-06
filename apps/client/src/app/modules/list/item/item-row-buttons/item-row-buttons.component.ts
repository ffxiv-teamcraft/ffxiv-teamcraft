import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemRowMenuElement } from '../../../../model/display/item-row-menu-element';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../settings/settings.service';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { takeUntil } from 'rxjs/operators';
import { Team } from '../../../../model/team/team';
import { PermissionLevel } from '../../../../core/database/permissions/permission-level.enum';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';

@Component({
  selector: 'app-item-row-buttons',
  templateUrl: './item-row-buttons.component.html',
  styleUrls: ['./item-row-buttons.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemRowButtonsComponent extends TeamcraftComponent implements OnInit {

  @Input()
  buttonsCache: { [key: string]: boolean };

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

  @Input()
  attachedRotation: string;

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
  masterbooks: number[]

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

  itemRowTypes = ItemRowMenuElement;

  constructor(private messageService: NzMessageService, private translate: TranslateService,
              public settings: SettingsService, private cd: ChangeDetectorRef) {
    super();
    this.settings.settingsChange$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(() => {
      this.cd.detectChanges();
    });
  }

  ngOnInit() {
  }

  public isButton(element: ItemRowMenuElement): boolean {
    return this.buttonsCache[element];
  }

  success(key: string, args?: any): void {
    this.messageService.success(this.translate.instant(key, args));
  }

}
