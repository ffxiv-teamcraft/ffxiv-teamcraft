import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { combineLatest, Observable } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { IpcService } from '../../../core/electron/ipc.service';
import { FoldersFacade, TreeFolderDisplay } from '../../../modules/folders/+state/folders.facade';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { DataModel } from '../../../core/database/storage/data-model';
import { Folder } from '../../../model/folder/folder';
import { CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';

@Component({
  selector: 'app-gearsets-page',
  templateUrl: './gearsets-page.component.html',
  styleUrls: ['./gearsets-page.component.less']
})
export class GearsetsPageComponent extends TeamcraftComponent implements OnInit {

  public loading$: Observable<boolean> = this.gearsetsFacade.loaded$.pipe(map(loaded => !loaded));

  public userId$: Observable<string> = this.authFacade.userId$;

  public display$: Observable<TreeFolderDisplay<TeamcraftGearset>>;

  public favoritesDisplay$: Observable<TreeFolderDisplay<TeamcraftGearset>>;

  public pcapToggle = false;

  public dndConnections = ['gearsets-root', 'folder-root'];

  constructor(private dialog: NzModalService, private gearsetsFacade: GearsetsFacade,
              private authFacade: AuthFacade, private ipc: IpcService,
              private foldersFacade: FoldersFacade) {
    super();
    this.ipc.pcapToggle$.subscribe(value => {
      this.pcapToggle = value;
    });

    this.display$ = this.userId$.pipe(
      switchMap(userId => {
        return this.foldersFacade.getDisplay<TeamcraftGearset>(
          this.foldersFacade.getUserFolders<TeamcraftGearset>(FolderContentType.GEARSET),
          this.gearsetsFacade.allGearsets$,
          key => this.gearsetsFacade.load(key),
          gearset => gearset.authorId === userId
        );
      })
    );

    this.favoritesDisplay$ = combineLatest([this.authFacade.favorites$, this.userId$]).pipe(
      switchMap(([favorites, userId]) => {
        return this.foldersFacade.getDisplay<TeamcraftGearset>(
          this.foldersFacade.getFavorites<TeamcraftGearset>(FolderContentType.GEARSET, 'gearsetFolders'),
          this.gearsetsFacade.allGearsets$,
          key => this.gearsetsFacade.load(key),
          gearset => gearset.authorId !== userId && (favorites.gearsets || []).indexOf(gearset.$key) > -1
        );
      })
    );
    this.authFacade.favorites$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(favorites => {
      (favorites.gearsetFolders || []).forEach(key => this.foldersFacade.load(key));
      (favorites.gearsets || []).forEach(key => this.gearsetsFacade.load(key));
    });
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

  importEtroGearset(): void {
    this.gearsetsFacade.importEtroGearset();
  }

  importFromPcap(): void {
    this.gearsetsFacade.importFromPcap();
  }

  syncFromPcap(): void {
    this.gearsetsFacade.syncFromPcap();
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
