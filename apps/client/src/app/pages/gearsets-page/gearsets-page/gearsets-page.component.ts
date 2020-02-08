import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { Observable } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { IpcService } from '../../../core/electron/ipc.service';
import { FoldersFacade, TreeFolderDisplay } from '../../../modules/folders/+state/folders.facade';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { DataModel } from '../../../core/database/storage/data-model';
import { Folder } from '../../../model/folder/folder';
import { CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-gearsets-page',
  templateUrl: './gearsets-page.component.html',
  styleUrls: ['./gearsets-page.component.less']
})
export class GearsetsPageComponent implements OnInit {

  public loaded$: Observable<boolean> = this.gearsetsFacade.loaded$;

  public userId$: Observable<string> = this.authFacade.userId$;

  public display$: Observable<TreeFolderDisplay<TeamcraftGearset>>;

  public machinaToggle = false;

  public dndConnections = ['gearsets-root', 'folder-root'];

  constructor(private dialog: NzModalService, private gearsetsFacade: GearsetsFacade,
              private authFacade: AuthFacade, private ipc: IpcService,
              private foldersFacade: FoldersFacade, private translate: TranslateService) {
    this.ipc.once('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
    this.ipc.send('toggle-machina:get');

    this.display$ = this.userId$.pipe(switchMap(userId => {
      return this.foldersFacade.getDisplay<TeamcraftGearset>(
        FolderContentType.GEARSET,
        this.gearsetsFacade.allGearsets$,
        key => this.gearsetsFacade.load(key),
        gearset => gearset.authorId === userId
      );
    }));
  }

  newFolder(): void {
    this.foldersFacade.createFolder(FolderContentType.GEARSET);
  }

  newGearset(): void {
    this.gearsetsFacade.createGearset();
  }

  importAriyalaGearset(): void {
    this.gearsetsFacade.importAriyalaGearset();
  }

  importFromPcap(): void {
    this.gearsetsFacade.importFromPcap();
  }

  importLodestoneGearset(): void {
    this.gearsetsFacade.importLodestoneGearset();
  }

  drop(event: any, root: TeamcraftGearset[]): void {
    moveItemInArray(root, event.previousIndex, event.currentIndex);
    root.forEach((row, i) => {
      row.index = i;
    });
    this.gearsetsFacade.saveIndexes(root);
  }

  dropFolder(event: any, displays: FolderDisplay<any>[]): void {
    const folders = displays.map(d => d.folder);
    moveItemInArray(folders, event.previousIndex, event.currentIndex);
    folders.forEach((row, i) => {
      row.index = i;
    });
    this.foldersFacade.saveIndexes(folders);
  }

  canDropGearset(drag: CdkDrag): boolean {
    return drag.data instanceof TeamcraftGearset;
  }

  canDropFolder(drag: CdkDrag): boolean {
    return drag.data instanceof Folder;
  }

  addDnDConnections(id: string): void {
    this.dndConnections = [
      ...this.dndConnections,
      id
    ];
  }

  trackByKey(index: number, data: DataModel): string {
    return data.$key;
  }

  ngOnInit(): void {
    this.gearsetsFacade.loadAll();
    this.foldersFacade.loadFolders(FolderContentType.GEARSET);
  }

}
