import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { AuthFacade } from '../../../+state/auth.facade';
import { FoldersFacade } from '../../../modules/folders/+state/folders.facade';
import { ActivatedRoute } from '@angular/router';
import { map, takeUntil, tap } from 'rxjs/operators';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { CraftingReplayFacade } from '../../../modules/crafting-replay/+state/crafting-replay.facade';
import { CraftingReplay } from '../../../modules/crafting-replay/model/crafting-replay';

@Component({
  selector: 'app-crafting-replay-folder',
  templateUrl: './crafting-replay-folder.component.html',
  styleUrls: ['./crafting-replay-folder.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CraftingReplayFolderComponent extends TeamcraftComponent {


  public userId$ = this.authFacade.userId$;

  public display$: Observable<FolderDisplay<CraftingReplay>>;

  public loading = true;

  constructor(private authFacade: AuthFacade, private craftingReplayFacade: CraftingReplayFacade,
              private foldersFacade: FoldersFacade, private activatedRoute: ActivatedRoute) {
    super();
    this.activatedRoute.paramMap.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(paramMap => {
      const key = paramMap.get('folderId');
      this.foldersFacade.load(key);
      this.foldersFacade.select(FolderContentType.CRAFTING_REPLAY, key);
    });

    this.display$ = this.foldersFacade.getSelectedFolderDisplay(
      FolderContentType.CRAFTING_REPLAY,
      this.craftingReplayFacade.allCraftingReplays$.pipe(
        map(replays => replays.filter(r => r.online))
      ),
      key => this.craftingReplayFacade.loadReplay(key)
    ).pipe(
      tap(() => this.loading = false)
    );
  }

}
