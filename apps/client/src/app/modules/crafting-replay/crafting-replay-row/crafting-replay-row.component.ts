import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CraftingReplay } from '../model/crafting-replay';
import { ReplaySimulationComponent } from '../replay-simulation/replay-simulation.component';
import { CraftingReplayFacade } from '../+state/crafting-replay.facade';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { PermissionsController } from '../../../core/database/permissions-controller';
import { SettingsService } from '../../settings/settings.service';
import { I18nPipe } from '../../../core/i18n.pipe';
import { CraftingActionPipe } from '../../../pipes/pipes/crafting-action.pipe';
import { TeamcraftLinkPipe } from '../../../pipes/pipes/teamcraft-link.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { ActionComponent } from '../../../pages/simulator/components/action/action.component';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-crafting-replay-row',
    templateUrl: './crafting-replay-row.component.html',
    styleUrls: ['./crafting-replay-row.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, RouterLink, ClipboardDirective, NzPopconfirmModule, ItemIconComponent, NgFor, ActionComponent, DatePipe, ItemNamePipe, TeamcraftLinkPipe, CraftingActionPipe, TranslateModule, I18nPipe]
})
export class CraftingReplayRowComponent {

  @Input()
  replay: CraftingReplay;

  @Input()
  userId: string;

  constructor(private craftingReplayFacade: CraftingReplayFacade, public translate: TranslateService,
              private message: NzMessageService, private dialog: NzModalService, public settings: SettingsService) {
  }

  get permissionLevel(): PermissionLevel {
    return PermissionsController.getPermissionLevel(this.replay, this.userId);
  }

  saveReplay(replay: CraftingReplay): void {
    this.craftingReplayFacade.saveReplay(replay);
  }

  deleteReplay(replay: CraftingReplay): void {
    this.craftingReplayFacade.deleteReplay(replay.$key);
  }

  openResultPopup(replay: CraftingReplay): void {
    this.dialog.create({
      nzTitle: this.translate.instant('CRAFTING_REPLAYS.Replay_result'),
      nzContent: ReplaySimulationComponent,
      nzComponentParams: {
        replay: replay
      },
      nzFooter: null
    });
  }

}
