import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CraftingReplayFacade } from '../../../modules/crafting-replay/+state/crafting-replay.facade';
import { map, startWith, switchMap } from 'rxjs/operators';
import { CraftingReplayService } from '../../../modules/crafting-replay/crafting-replay.service';
import { TranslateService } from '@ngx-translate/core';
import { CraftingReplay } from '../../../modules/crafting-replay/model/crafting-replay';
import { IpcService } from '../../../core/electron/ipc.service';
import { PlatformService } from '../../../core/tools/platform.service';
import { FoldersFacade } from '../../../modules/folders/+state/folders.facade';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { AuthFacade } from '../../../+state/auth.facade';
import { CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { Folder } from '../../../model/folder/folder';
import { DataModel } from '../../../core/database/storage/data-model';

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
    startWith(false),
    map(stats => !stats && this.ipc.pcapToggle)
  );

  public userId$ = this.authFacade.userId$;

  public onlineDisplay$ = this.userId$.pipe(
    switchMap(userId => {
      return this.foldersFacade.getDisplay<CraftingReplay>(
        this.foldersFacade.getUserFolders<CraftingReplay>(FolderContentType.CRAFTING_REPLAY),
        this.onlineReplays$,
        key => this.craftingReplayFacade.loadReplay(key),
        gearset => gearset.authorId === userId
      );
    })
  );

  public dndConnections = ['replays-root', 'folder-root'];

  constructor(private craftingReplayFacade: CraftingReplayFacade, private craftingReplayService: CraftingReplayService,
              public translate: TranslateService, private ipc: IpcService, public platform: PlatformService, private foldersFacade: FoldersFacade,
              private authFacade: AuthFacade) {
    this.foldersFacade.loadFolders(FolderContentType.CRAFTING_REPLAY);
    this.craftingReplayFacade.loadAll();
  }

  newFolder(): void {
    this.foldersFacade.createFolder(FolderContentType.CRAFTING_REPLAY);
  }

  canDropFolder(drag: CdkDrag): boolean {
    return drag.data instanceof Folder;
  }

  canDropReplay(drag: CdkDrag): boolean {
    return drag.data instanceof CraftingReplay;
  }

  addDnDConnections(id: string): void {
    this.dndConnections = [
      ...this.dndConnections,
      id
    ];
  }

  dropFolder(event: any, displays: FolderDisplay<CraftingReplay>[]): void {
    const folders = displays.map(d => d.folder);
    moveItemInArray(folders, event.previousIndex, event.currentIndex);
    folders.forEach((row, i) => {
      row.index = i;
    });
    this.foldersFacade.saveIndexes(folders);
  }

  trackByKey(index: number, data: DataModel): string {
    return data.$key;
  }

  clearOfflineReplays(): void {
    this.craftingReplayFacade.clearOfflineReplays();
  }

}
