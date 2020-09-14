import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CraftingReplayFacade } from '../../../modules/crafting-replay/+state/crafting-replay.facade';
import { map } from 'rxjs/operators';
import { CraftingReplayService } from '../../../modules/crafting-replay/crafting-replay.service';
import { TranslateService } from '@ngx-translate/core';
import { CraftingReplay } from '../../../modules/crafting-replay/model/crafting-replay';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-crafting-replays',
  templateUrl: './crafting-replays.component.html',
  styleUrls: ['./crafting-replays.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CraftingReplaysComponent {

  public loaded$ = this.craftingReplayFacade.loaded$;

  public offlineReplays$ = this.craftingReplayFacade.allCraftingReplays$.pipe(
    map(replays => replays.filter(r => !r.online))
  );

  public onlineReplays$ = this.craftingReplayFacade.allCraftingReplays$.pipe(
    map(replays => replays.filter(r => r.online))
  );

  public hasStats$ = this.craftingReplayService.stats$.pipe(map(stats => !!stats));

  constructor(private craftingReplayFacade: CraftingReplayFacade, private craftingReplayService: CraftingReplayService,
              public translate: TranslateService, private message: NzMessageService) {
  }

  saveReplay(replay: CraftingReplay): void {
    this.craftingReplayFacade.saveReplay(replay);
  }

  afterLinkCopied():void{
    this.message.success(this.translate.instant('COMMON.Share_link_copied'));
  }

  deleteReplay(replay: CraftingReplay): void {
    this.craftingReplayFacade.deleteReplay(replay.$key);
  }

}
