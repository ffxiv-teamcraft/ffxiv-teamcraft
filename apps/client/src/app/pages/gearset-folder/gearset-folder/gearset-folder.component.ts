import { Component, DestroyRef, inject } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { FoldersFacade } from '../../../modules/folders/+state/folders.facade';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { FolderDisplay } from '../../../model/folder/folder-display';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetRowComponent } from '../../../modules/gearsets/gearset-row/gearset-row.component';
import { FolderPageComponent } from '../../../modules/folders/folder-page/folder-page.component';
import { AsyncPipe } from '@angular/common';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { SeoService } from '../../../core/seo/seo.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-gearset-folder',
    templateUrl: './gearset-folder.component.html',
    styleUrls: ['./gearset-folder.component.less'],
    standalone: true,
    imports: [PageLoaderComponent, FolderPageComponent, GearsetRowComponent, AsyncPipe]
})
export class GearsetFolderComponent {
  public userId$ = this.authFacade.userId$;

  public display$: Observable<FolderDisplay<TeamcraftGearset>>;

  public loading = true;

  private seoService = inject(SeoService)

  private destroyRef = inject(DestroyRef)

  constructor(private authFacade: AuthFacade, private gearsetsFacade: GearsetsFacade,
              private foldersFacade: FoldersFacade, private activatedRoute: ActivatedRoute) {

    this.activatedRoute.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
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

    combineLatest([this.display$, this.userId$]).pipe(
      map(([display, userId]) => {
        return {
          title: `${display.folder.name} - FFXIV Teamcraft`,
          description: `A folder containing ${display.content.length} gearsets.`,
          url: `https://ffxivteamcraft.com/user/${userId}/gearsets/folder/${display.folder.$key}`,
          image: 'https://ffxivteamcraft.com/assets/logo.png'
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((seoData) => {
      this.seoService.setConfig(seoData)
    });
  }
}
