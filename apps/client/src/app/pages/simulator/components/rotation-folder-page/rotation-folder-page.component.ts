import { Component } from '@angular/core';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { RotationFoldersFacade } from '../../../../modules/rotation-folders/+state/rotation-folders.facade';
import { CraftingRotationsFolder } from '../../../../model/other/crafting-rotations-folder';
import { combineLatest, Observable } from 'rxjs';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { ActivatedRoute } from '@angular/router';
import { map, shareReplay } from 'rxjs/operators';
import { AuthFacade } from '../../../../+state/auth.facade';

@Component({
  selector: 'app-rotation-folder-page',
  templateUrl: './rotation-folder-page.component.html',
  styleUrls: ['./rotation-folder-page.component.less']
})
export class RotationFolderPageComponent {

  folder$: Observable<CraftingRotationsFolder>;

  rotations$: Observable<CraftingRotation[]>;

  userId$: Observable<string>;

  constructor(private rotationsFacade: RotationsFacade, private foldersFacade: RotationFoldersFacade,
              private authFacade: AuthFacade, private route: ActivatedRoute) {
    this.route.paramMap.pipe(
      map(params => params.get('folderId'))
    ).subscribe(folderId => {
      this.foldersFacade.loadFolder(folderId);
      this.foldersFacade.select(folderId);
    });
    this.userId$ = this.authFacade.userId$;
    this.folder$ = this.foldersFacade.selectedRotationFolder$;
    this.rotations$ = combineLatest([this.folder$, this.rotationsFacade.allRotations$]).pipe(
      map(([folder, rotations]) => {
        return folder.rotationIds
          .map(id => rotations.find(r => r.$key === id))
          .filter(rotation => rotation && !rotation.notFound);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

}
