import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { Observable } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { IpcService } from '../../../core/electron/ipc.service';
import { FoldersFacade } from '../../../modules/folders/+state/folders.facade';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { FolderDisplay } from '../../../model/folder/folder-display';

@Component({
  selector: 'app-gearsets-page',
  templateUrl: './gearsets-page.component.html',
  styleUrls: ['./gearsets-page.component.less']
})
export class GearsetsPageComponent implements OnInit {

  public loaded$: Observable<boolean> = this.gearsetsFacade.loaded$;

  public gearsets$: Observable<TeamcraftGearset[]> = this.gearsetsFacade.myGearsets$;

  public userId$: Observable<string> = this.authFacade.userId$;

  public folders$: Observable<FolderDisplay<TeamcraftGearset>[]>;

  public machinaToggle = false;

  constructor(private dialog: NzModalService, private gearsetsFacade: GearsetsFacade,
              private authFacade: AuthFacade, private ipc: IpcService,
              private foldersFacade: FoldersFacade) {
    this.ipc.once('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
    this.ipc.send('toggle-machina:get');

    this.folders$ = this.foldersFacade.getDisplay<TeamcraftGearset>(
      FolderContentType.GEARSET,
      this.gearsetsFacade.allGearsets$,
      key => this.gearsetsFacade.load(key)
    );
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

  deleteGearset(key: string): void {
    this.gearsetsFacade.delete(key);
  }

  ngOnInit(): void {
    this.gearsetsFacade.loadAll();
    this.foldersFacade.loadFolders(FolderContentType.GEARSET);
  }

}
