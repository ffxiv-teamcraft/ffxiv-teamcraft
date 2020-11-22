import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CraftingReplay } from '../model/crafting-replay';
import { ReplaySimulationComponent } from '../replay-simulation/replay-simulation.component';
import { CraftingReplayFacade } from '../+state/crafting-replay.facade';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';

@Component({
  selector: 'app-crafting-replay-row',
  templateUrl: './crafting-replay-row.component.html',
  styleUrls: ['./crafting-replay-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CraftingReplayRowComponent {

  @Input()
  replay: CraftingReplay;

  @Input()
  userId: string;

  get permissionLevel(): PermissionLevel {
    return this.replay.getPermissionLevel(this.userId);
  }

  constructor(private craftingReplayFacade: CraftingReplayFacade, public translate: TranslateService,
              private message: NzMessageService, private dialog: NzModalService) {
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
