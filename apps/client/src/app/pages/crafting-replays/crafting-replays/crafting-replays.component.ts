import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CraftingReplayFacade } from '../../../modules/crafting-replay/+state/crafting-replay.facade';
import { map } from 'rxjs/operators';
import { CraftingReplayService } from '../../../modules/crafting-replay/crafting-replay.service';
import { TranslateService } from '@ngx-translate/core';
import { CraftingReplay } from '../../../modules/crafting-replay/model/crafting-replay';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { ReplaySimulationComponent } from '../../../modules/crafting-replay/replay-simulation/replay-simulation.component';
import { IpcService } from '../../../core/electron/ipc.service';
import { PlatformService } from '../../../core/tools/platform.service';

@Component({
  selector: 'app-crafting-replays',
  templateUrl: './crafting-replays.component.html',
  styleUrls: ['./crafting-replays.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CraftingReplaysComponent {

  public loading$ = this.craftingReplayFacade.loaded$.pipe(map(loaded => !loaded));

  public offlineReplays$ = this.craftingReplayFacade.userCraftingReplays$.pipe(
    map(replays => replays.filter(r => !r.online))
  );

  public onlineReplays$ = this.craftingReplayFacade.userCraftingReplays$.pipe(
    map(replays => replays.filter(r => r.online))
  );

  public showStatWarning$ = this.craftingReplayService.stats$.pipe(
    map(stats => !stats && this.ipc.machinaToggle)
  );

  constructor(private craftingReplayFacade: CraftingReplayFacade, private craftingReplayService: CraftingReplayService,
              public translate: TranslateService, private message: NzMessageService, private dialog: NzModalService,
              private ipc: IpcService, public platform: PlatformService) {
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

  saveReplay(replay: CraftingReplay): void {
    this.craftingReplayFacade.saveReplay(replay);
  }

  afterLinkCopied(): void {
    this.message.success(this.translate.instant('COMMON.Share_link_copied'));
  }

  deleteReplay(replay: CraftingReplay): void {
    this.craftingReplayFacade.deleteReplay(replay.$key);
  }

}
