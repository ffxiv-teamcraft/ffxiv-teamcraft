import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { takeUntil } from 'rxjs/operators';
import { CraftingReplayFacade } from '../../../modules/crafting-replay/+state/crafting-replay.facade';
import { CraftingReplay } from '../../../modules/crafting-replay/model/crafting-replay';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-crafting-replay',
  templateUrl: './crafting-replay.component.html',
  styleUrls: ['./crafting-replay.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CraftingReplayComponent extends TeamcraftComponent {

  public replay$: Observable<CraftingReplay> = this.craftingReplayFacade.selectedCraftingReplay$;

  constructor(private activeRoute: ActivatedRoute, private craftingReplayFacade: CraftingReplayFacade,
              public translate: TranslateService) {
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
