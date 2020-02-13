import { Component } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { FoldersFacade } from '../../../modules/folders/+state/folders.facade';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { takeUntil, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';

@Component({
  selector: 'app-gearset-folder',
  templateUrl: './gearset-folder.component.html',
  styleUrls: ['./gearset-folder.component.less']
})
export class GearsetFolderComponent extends TeamcraftComponent {

  public userId$ = this.authFacade.userId$;

  public display$: Observable<FolderDisplay<TeamcraftGearset>>;

  public loading = true;

  constructor(private authFacade: AuthFacade, private gearsetsFacade: GearsetsFacade,
              private foldersFacade: FoldersFacade, private activatedRoute: ActivatedRoute) {
    super();
    this.activatedRoute.paramMap.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(paramMap => {
      const key = paramMap.get('folderId');
      this.foldersFacade.load(key);
      this.foldersFacade.select(FolderContentType.GEARSET, key);
    });

    this.display$ = this.foldersFacade.getSelectedFolderDisplay(
      FolderContentType.GEARSET,
      this.gearsetsFacade.allGearsets$,
      key => this.gearsetsFacade.load(key)
    ).pipe(
      tap(() => this.loading = false)
    );
  }

}
