import { Component } from '@angular/core';
import { CustomLink } from '../../../core/database/custom-links/custom-link';
import { combineLatest, Observable, of } from 'rxjs';
import { CustomLinksFacade } from '../../../modules/custom-links/+state/custom-links.facade';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { RotationsFacade } from '../../../modules/rotations/+state/rotations.facade';
import { RotationFoldersFacade } from '../../../modules/rotation-folders/+state/rotation-folders.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzListModule } from 'ng-zorro-antd/list';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-custom-links',
    templateUrl: './custom-links.component.html',
    styleUrls: ['./custom-links.component.less'],
    standalone: true,
    imports: [NgIf, FullpageMessageComponent, NzListModule, FlexModule, NzTagModule, NzButtonModule, NzWaveModule, NzToolTipModule, ClipboardDirective, NzIconModule, NzPopconfirmModule, PageLoaderComponent, AsyncPipe, TranslateModule]
})
export class CustomLinksComponent {

  public linksDisplay$: Observable<{ link: CustomLink, targetName: string }[]>;

  constructor(private customLinksFacade: CustomLinksFacade,
              private listsFacade: ListsFacade,
              private workshopsFacade: WorkshopsFacade,
              private rotationsFacade: RotationsFacade,
              private rotationFoldersFacade: RotationFoldersFacade,
              private message: NzMessageService,
              private translate: TranslateService) {
    this.linksDisplay$ = this.customLinksFacade.myCustomLinks$.pipe(
      switchMap(links => {
        if (links.length === 0) {
          return of([]);
        }
        return combineLatest(links.map(link => {
          return this.loadTargetName(link).pipe(
            map(targetName => {
              return {
                link: link,
                targetName: targetName
              };
            }));
        })).pipe(
          map(results => {
            return results.filter(row => {
              return !!row.targetName;
            });
          })
        );
      })
    );
    this.customLinksFacade.loadMyCustomLinks();
  }

  deleteLink(key: string): void {
    this.customLinksFacade.deleteCustomLink(key);
  }

  private loadTargetName(link: CustomLink): Observable<string> {
    switch (link.getType()) {
      case 'list': {
        this.listsFacade.load(link.getEntityId());
        return this.listsFacade.allListDetails$.pipe(
          map(lists => lists.find(l => l.$key === link.getEntityId())),
          tap(list => {
            if (!list || list.notFound) {
              console.log('NOT FOUND', link.getEntityId());
              this.customLinksFacade.deleteCustomLink(link.$key);
            }
          }),
          map(list => list ? list.name : null)
        );
      }
      case 'workshop': {
        this.workshopsFacade.loadWorkshop(link.getEntityId());
        return this.workshopsFacade.allWorkshops$.pipe(
          map(workshops => workshops.find(l => l.$key === link.getEntityId())),
          filter(l => l !== undefined),
          tap(workshop => {
            if (workshop.notFound) {
              console.log('NOT FOUND', link.getEntityId());
              this.customLinksFacade.deleteCustomLink(link.$key);
            }
          }),
          map(workshop => workshop.name)
        );
      }
      case 'rotation': {
        this.rotationsFacade.getRotation(link.getEntityId());
        return this.rotationsFacade.allRotations$.pipe(
          map(rotations => rotations.find(l => l.$key === link.getEntityId())),
          filter(l => l !== undefined),
          tap(rotation => {
            if (rotation.notFound) {
              console.log('NOT FOUND', link.getEntityId());
              this.customLinksFacade.deleteCustomLink(link.$key);
            }
          }),
          map(rotation => rotation.getName())
        );
      }
      case 'rotation-folder': {
        this.rotationFoldersFacade.loadFolder(link.getEntityId());
        return this.rotationFoldersFacade.allRotationFolders$.pipe(
          map(folders => folders.find(l => l.$key === link.getEntityId())),
          filter(l => l !== undefined),
          tap(folder => {
            if (folder.notFound) {
              console.log('NOT FOUND', link.getEntityId());
              this.customLinksFacade.deleteCustomLink(link.$key);
            }
          }),
          map(folder => folder.name)
        );
      }
      case 'template': {
        this.listsFacade.load(link.getEntityId());
        return this.listsFacade.allListDetails$.pipe(
          map(lists => lists.find(l => l.$key === link.getEntityId())),
          tap(list => {
            if (!list || list.notFound) {
              console.log('NOT FOUND', link.getEntityId());
              this.customLinksFacade.deleteCustomLink(link.$key);
            }
          }),
          map(list => list ? list.name : null)
        );
      }
    }
  }

}
