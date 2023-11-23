import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { takeUntil } from 'rxjs/operators';
import { CraftingReplayFacade } from '../../../modules/crafting-replay/+state/crafting-replay.facade';
import { CraftingReplay } from '../../../modules/crafting-replay/model/crafting-replay';
import { Observable } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { CharacterNamePipe } from '../../../pipes/pipes/character-name.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { ReplaySimulationComponent } from '../../../modules/crafting-replay/replay-simulation/replay-simulation.component';
import { UserAvatarComponent } from '../../../modules/user-avatar/user-avatar/user-avatar.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NgIf, AsyncPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-crafting-replay',
    templateUrl: './crafting-replay.component.html',
    styleUrls: ['./crafting-replay.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, FullpageMessageComponent, FlexModule, UserAvatarComponent, ReplaySimulationComponent, PageLoaderComponent, AsyncPipe, DatePipe, TranslateModule, CharacterNamePipe]
})
export class CraftingReplayComponent extends TeamcraftComponent {

  public replay$: Observable<CraftingReplay> = this.craftingReplayFacade.selectedCraftingReplay$;

  constructor(private activeRoute: ActivatedRoute, private craftingReplayFacade: CraftingReplayFacade,
              public translate: TranslateService, public settings: SettingsService) {
    super();
    this.activeRoute.paramMap.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(paramMap => {
        this.craftingReplayFacade.loadReplay(paramMap.get('replayId'));
        this.craftingReplayFacade.selectReplay(paramMap.get('replayId'));
      }
    );
  }

}
