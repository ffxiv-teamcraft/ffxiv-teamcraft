import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemRowMenuElement } from '../../../../model/display/item-row-menu-element';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../settings/settings.service';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { takeUntil } from 'rxjs/operators';
import { Team } from '../../../../model/team/team';

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
  isCraft: boolean;// (list, list.authorId === userId, item)

  @Input()
  hasAlarms: boolean;// item.alarms !== undefined && item.alarms.length > 0

  @Input()
  attachedRotation: string;

  @Input()
  userId: string;

  @Input()
  commentBadge: boolean;

  @Input()
  team: Team;

  @Input()
  workingOnIt: string[];

  @Output()
  attachRotation = new EventEmitter<void>();

  @Output()
  detachRotation = new EventEmitter<void>();

  @Output()
  openCommentsPopup = new EventEmitter<void>();

  @Output()
  addAllAlarms = new EventEmitter<void>();

  @Output()
  assignTeamMember = new EventEmitter<string>();

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
